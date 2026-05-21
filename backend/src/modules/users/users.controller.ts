import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../../config/prisma';
import { withAuditLog } from '../../utils/auditLog';
import { sendSuccess, sendCreated, sendNotFound, sendError } from '../../utils/response';

export async function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, username: true, role: true,
        isActive: true, createdAt: true, updatedAt: true,
        _count: { select: { transactions: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    sendSuccess(res, users);
  } catch (err) { next(err); }
}

export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, username: true, role: true,
        isActive: true, createdAt: true, updatedAt: true,
        _count: { select: { transactions: true, expenses: true } },
      },
    });
    if (!user) { sendNotFound(res, 'User'); return; }
    sendSuccess(res, user);
  } catch (err) { next(err); }
}

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, username, password, role, isActive } = req.body;

    const existing = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
    if (existing) {
      sendError(res, 'Username already taken', 409);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await withAuditLog(
      prisma,
      req.user!.userId,
      'CREATE',
      'users',
      (u) => u.id,
      null,
      (u) => ({ id: u.id, name: u.name, username: u.username, role: u.role }),
      (tx) => tx.user.create({
        data: { name, username: username.toLowerCase(), passwordHash, role, isActive: isActive ?? true },
        select: { id: true, name: true, username: true, role: true, isActive: true, createdAt: true },
      })
    );

    sendCreated(res, user, 'User created successfully');
  } catch (err) { next(err); }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) { sendNotFound(res, 'User'); return; }

    // Prevent deactivating the last super admin
    if (req.body.isActive === false && existing.role === 'SUPER_ADMIN') {
      const superAdminCount = await prisma.user.count({
        where: { role: 'SUPER_ADMIN', isActive: true },
      });
      if (superAdminCount <= 1) {
        sendError(res, 'Cannot deactivate the last Super Admin', 400);
        return;
      }
    }

    const updateData: Record<string, unknown> = { ...req.body };
    if (req.body.password) {
      updateData.passwordHash = await bcrypt.hash(req.body.password, 12);
      delete updateData.password;
    }
    if (req.body.username) {
      updateData.username = req.body.username.toLowerCase();
    }

    const updated = await withAuditLog(
      prisma, req.user!.userId, 'UPDATE', 'users',
      (u) => u.id,
      { id: existing.id, name: existing.name, role: existing.role, isActive: existing.isActive },
      (u) => ({ id: u.id, name: u.name, role: u.role, isActive: u.isActive }),
      (tx) => tx.user.update({
        where: { id: req.params.id },
        data: updateData,
        select: { id: true, name: true, username: true, role: true, isActive: true, updatedAt: true },
      })
    );

    sendSuccess(res, updated, 200, undefined, 'User updated');
  } catch (err) { next(err); }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id;
    const user = await prisma.user.findUnique({ 
      where: { id },
      include: {
        _count: {
          select: { transactions: true, expenses: true, logs: true }
        }
      }
    });
    
    if (!user) { sendNotFound(res, 'User'); return; }

    if (id === req.user!.userId) {
      sendError(res, 'Cannot delete your own account', 400);
      return;
    }

    // Check if user has any activity
    const hasActivity = user._count.transactions > 0 || user._count.expenses > 0;

    if (hasActivity) {
      // Soft-delete by deactivating to preserve financial audit trail
      await withAuditLog(
        prisma, req.user!.userId, 'DELETE', 'users',
        () => id,
        { id: user.id, name: user.name, username: user.username, action: 'SOFT_DELETE' },
        () => null,
        (tx) => tx.user.update({
          where: { id },
          data: { isActive: false },
        })
      );
      sendSuccess(res, null, 200, undefined, 'User has transactions and was deactivated to preserve history');
    } else {
      // Hard delete if no activity exists
      await withAuditLog(
        prisma, req.user!.userId, 'DELETE', 'users',
        () => id,
        { id: user.id, name: user.name, username: user.username, action: 'HARD_DELETE' },
        () => null,
        (tx) => {
          // First delete logs associated with this user to avoid Restrict constraint
          return Promise.all([
            tx.log.deleteMany({ where: { userId: id } }),
            tx.user.delete({ where: { id } })
          ]);
        }
      );
      sendSuccess(res, null, 200, undefined, 'User deleted permanently');
    }
  } catch (err) { next(err); }
}
