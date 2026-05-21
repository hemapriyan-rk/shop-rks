import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { withAuditLog } from '../../utils/auditLog';
import { isAdminOrAbove, isSuperAdmin } from '../../middleware/auth';
import { isToday, getISTDayBounds, toISTDateString } from '../../utils/time';
import {
  sendSuccess, sendCreated, sendNotFound, sendError,
  sendForbidden, sendConflict
} from '../../utils/response';

const TX_SELECT = {
  id: true, quantity: true, unitPrice: true, totalPrice: true,
  notes: true, createdAt: true, updatedAt: true,
  user: { select: { id: true, name: true, username: true } },
  service: { select: { id: true, name: true, category: true } },
};

export async function getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { date, userId: queryUserId, page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // USERs can only see their own; ADMIN+ can see all or filter by userId
    const isAdmin = isAdminOrAbove(req.user!.role);
    const filterUserId = isAdmin
      ? (queryUserId as string | undefined)
      : req.user!.userId;

    const targetDate = (date as string);
    let dateFilter = {};
    if (targetDate) {
      const { start, end } = getISTDayBounds(targetDate);
      dateFilter = { createdAt: { gte: start, lte: end } };
    }

    const where = {
      ...(filterUserId && { userId: filterUserId }),
      ...dateFilter,
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        select: TX_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.transaction.count({ where }),
    ]);

    sendSuccess(res, transactions, 200, { total, page: pageNum, limit: limitNum, date: targetDate });
  } catch (err) { next(err); }
}

export async function createTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { serviceId, quantity, notes, unitPrice: customUnitPrice } = req.body as {
      serviceId: string; quantity: number; notes?: string; unitPrice?: number;
    };

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      sendNotFound(res, 'Service');
      return;
    }

    const unitPrice = customUnitPrice !== undefined ? Number(customUnitPrice) : Number(service.price);
    const totalPrice = unitPrice * quantity;

    const transaction = await withAuditLog(
      prisma, req.user!.userId, 'CREATE', 'transactions',
      (t) => t.id, null,
      (t) => ({ serviceId: t.service?.id, quantity: t.quantity, totalPrice: t.totalPrice }),
      (tx) => tx.transaction.create({
        data: {
          userId: req.user!.userId,
          serviceId,
          quantity,
          unitPrice,
          totalPrice,
          notes,
        },
        select: TX_SELECT,
      })
    );

    sendCreated(res, transaction, 'Transaction recorded');
  } catch (err) { next(err); }
}

export async function updateTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { updatedAt, quantity, notes } = req.body as {
      updatedAt: string; quantity?: number; notes?: string;
    };

    const existing = await prisma.transaction.findUnique({
      where: { id: req.params.id },
      include: { service: true },
    });

    if (!existing) { sendNotFound(res, 'Transaction'); return; }

    // Fix #2: Optimistic locking — check updatedAt matches
    if (new Date(existing.updatedAt).toISOString() !== new Date(updatedAt).toISOString()) {
      sendConflict(res, 'This record was modified by another user. Please refresh and try again.');
      return;
    }

    // Fix #4 (today-guard): Only allow edits to today's records (Super Admin can bypass)
    if (!isToday(existing.createdAt) && !isSuperAdmin(req.user!.role)) {
      sendForbidden(res, 'Only today\'s records can be edited (or use Super Admin override)');
      return;
    }

    // USERs can only edit their own records
    if (!isAdminOrAbove(req.user!.role) && existing.userId !== req.user!.userId) {
      sendForbidden(res, 'You can only edit your own records');
      return;
    }

    const newQuantity = quantity ?? existing.quantity;
    const newTotal = Number(existing.unitPrice) * newQuantity;

    const updated = await withAuditLog(
      prisma, req.user!.userId, 'UPDATE', 'transactions',
      (t) => t.id,
      { quantity: existing.quantity, notes: existing.notes, totalPrice: existing.totalPrice },
      (t) => ({ quantity: t.quantity, notes: t.notes, totalPrice: t.totalPrice }),
      (tx) => tx.transaction.update({
        where: { id: req.params.id },
        data: { quantity: newQuantity, totalPrice: newTotal, ...(notes !== undefined && { notes }) },
        select: TX_SELECT,
      })
    );

    sendSuccess(res, updated, 200, undefined, 'Transaction updated');
  } catch (err) { next(err); }
}

export async function deleteTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.transaction.findUnique({ where: { id: req.params.id } });
    if (!existing) { sendNotFound(res, 'Transaction'); return; }

    if (!isToday(existing.createdAt) && !isSuperAdmin(req.user!.role)) {
      sendForbidden(res, 'Only today\'s records can be deleted (or use Super Admin override)');
      return;
    }

    await withAuditLog(
      prisma, req.user!.userId, 'DELETE', 'transactions',
      () => req.params.id,
      { userId: existing.userId, serviceId: existing.serviceId, totalPrice: existing.totalPrice },
      () => null,
      (tx) => tx.transaction.delete({ where: { id: req.params.id } })
    );

    sendSuccess(res, null, 200, undefined, 'Transaction deleted');
  } catch (err) { next(err); }
}
