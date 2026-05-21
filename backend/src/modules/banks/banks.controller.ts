import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { withAuditLog } from '../../utils/auditLog';
import { sendSuccess, sendNotFound, sendError } from '../../utils/response';

const BANK_SELECT = {
  id: true,
  name: true,
  balance: true,
  createdAt: true,
  updatedAt: true,
};

export async function getBanks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const banks = await prisma.bankAccount.findMany({
      select: BANK_SELECT,
      orderBy: { name: 'asc' },
    });
    sendSuccess(res, banks);
  } catch (err) { next(err); }
}

export async function getBankAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { date, action } = req.query;
    const { start, end } = date ? 
      require('../../utils/time').getISTDayBounds(date as string) : 
      { start: undefined, end: undefined };

    const banks = await prisma.bankAccount.findMany({
      select: {
        ...BANK_SELECT,
        expenses: {
          where: { 
            status: 'APPROVED', 
            bankId: { not: null },
            ...(start && { createdAt: { gte: start, lte: end } })
          },
          select: {
            id: true, amount: true, category: true, note: true, createdAt: true,
            user: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: date ? 50 : 10,
        },
        _count: {
          select: { expenses: { where: { status: 'APPROVED' } } }
        },
      },
      orderBy: { name: 'asc' },
    });

    // Compute total deducted and fetch logs per bank
    const analytics = await Promise.all(banks.map(async (bank) => {
      const [total, logs] = await Promise.all([
        prisma.expense.aggregate({
          where: { bankId: bank.id, status: 'APPROVED' },
          _sum: { amount: true },
        }),
        prisma.log.findMany({
          where: { 
            tableName: 'bank_accounts', 
            recordId: bank.id,
            ...(start && { createdAt: { gte: start, lte: end } }),
            ...(action && action !== 'EXPENSE' && { action: action as any }),
          },
          select: {
            id: true, action: true, newValue: true, createdAt: true,
            user: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: date ? 50 : 10,
        })
      ]);

      return {
        ...bank,
        totalDeducted: Number(total._sum.amount ?? 0),
        logs,
      };
    }));

    sendSuccess(res, analytics);
  } catch (err) { next(err); }
}

export async function depositToBank(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { amount, note } = req.body;

    const bank = await prisma.bankAccount.findUnique({ where: { id } });
    if (!bank) { sendNotFound(res, 'Bank'); return; }

    const updated = await withAuditLog(
      prisma, req.user!.userId, 'UPDATE', 'bank_accounts',
      (b) => b.id,
      { balance: bank.balance, action: 'DEPOSIT', amount, note },
      (b) => ({ balance: b.balance }),
      (tx) => tx.bankAccount.update({
        where: { id },
        data: { balance: { increment: amount } },
        select: BANK_SELECT,
      })
    );

    sendSuccess(res, updated, 200, undefined, `₹${amount} deposited to ${bank.name}`);
  } catch (err) { next(err); }
}

export async function setBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { balance, note } = req.body;

    const bank = await prisma.bankAccount.findUnique({ where: { id } });
    if (!bank) { sendNotFound(res, 'Bank'); return; }

    if (balance < 0) {
      sendError(res, 'Balance cannot be negative', 400);
      return;
    }

    const updated = await withAuditLog(
      prisma, req.user!.userId, 'UPDATE', 'bank_accounts',
      (b) => b.id,
      { balance: bank.balance, action: 'SET_BALANCE', note },
      (b) => ({ balance: b.balance }),
      (tx) => tx.bankAccount.update({
        where: { id },
        data: { balance },
        select: BANK_SELECT,
      })
    );

    sendSuccess(res, updated, 200, undefined, `${bank.name} balance set to ₹${balance}`);
  } catch (err) { next(err); }
}
