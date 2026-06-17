import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { sendSuccess, sendError, sendUnauthorized } from '../../utils/response';
import { socketBroadcast } from '../../config/socket';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password } = req.body as { username: string; password: string };
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    let loginAttempt = await prisma.loginAttempt.findUnique({ where: { ipAddress: ip } });
    if (loginAttempt) {
      if (loginAttempt.pastBlocks >= 2) {
        res.status(403).json({ success: false, error: 'Access permanently blocked from this device due to suspicious activity.' });
        return;
      }
      if (loginAttempt.blockedUntil && new Date(loginAttempt.blockedUntil) > new Date()) {
        const remaining = Math.ceil((new Date(loginAttempt.blockedUntil).getTime() - Date.now()) / (1000 * 60 * 60));
        res.status(403).json({ success: false, error: `Too many failed attempts. Try again in ${remaining} hours.` });
        return;
      }
      if (loginAttempt.blockedUntil && new Date(loginAttempt.blockedUntil) <= new Date()) {
        loginAttempt = await prisma.loginAttempt.update({
          where: { ipAddress: ip },
          data: { attempts: 0, blockedUntil: null }
        });
      }
    }

    const handleFailedLogin = async () => {
      const attempt = await prisma.loginAttempt.upsert({
        where: { ipAddress: ip },
        update: { attempts: { increment: 1 } },
        create: { ipAddress: ip, attempts: 1 }
      });
      
      const alert = await prisma.systemAlert.create({
        data: {
          type: attempt.attempts >= 5 ? 'ERROR' : 'WARNING',
          source: 'LOGIN_ATTEMPT',
          message: `Failed login attempt for username: ${username}`,
          ipAddress: ip
        }
      });
      socketBroadcast({ type: 'NEW_ALERT', targetRole: 'SUPER_ADMIN', payload: alert });
      
      if (attempt.attempts >= 5) {
        if (attempt.pastBlocks >= 1) {
          await prisma.loginAttempt.update({
            where: { ipAddress: ip },
            data: { pastBlocks: 2, blockedUntil: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000) }
          });
          return `Access permanently blocked from this device due to suspicious activity.`;
        } else {
          await prisma.loginAttempt.update({
            where: { ipAddress: ip },
            data: { pastBlocks: 1, blockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) }
          });
          return `Too many failed attempts. Try again in 24 hours.`;
        }
      }
      const remaining = 5 - attempt.attempts;
      return `Invalid credentials. You have ${remaining} attempt(s) left.`;
    };

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() },
      include: { customRole: true }
    });

    if (!user || !user.isActive) {
      const msg = await handleFailedLogin();
      sendUnauthorized(res, msg);
      return;
    }

    if (user.isSuspended) {
      sendError(res, 'Your account is suspended. Please contact an administrator.', 403);
      return;
    }

    if (user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
      const remaining = Math.ceil((new Date(user.bannedUntil).getTime() - Date.now()) / 60000);
      sendUnauthorized(res, `Account suspended. Try again in ${remaining} minutes.`);
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const msg = await handleFailedLogin();
      sendUnauthorized(res, msg);
      return;
    }

    // Check for Maintenance Mode (Immunity for SUPER_ADMIN)
    const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
    if (config?.maintenanceMode && user.role !== 'SUPER_ADMIN') {
      res.status(503).json({
        success: false,
        error: config.maintenanceMessage || 'Server is under maintenance. Only Super Admins can log in right now.',
        maintenance: true
      });
      return;
    }

    // Create session record
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
      }
    });

    const payload: any = {
      userId: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      sessionId: session.id, // Added sessionId
    };

    if (user.role === 'CUSTOM' && user.customRole) {
      payload.customPermissions = user.customRole.permissions;
    }

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as `${number}${'s'|'m'|'h'|'d'}`,
    });

    // Reset login attempts on success
    if (loginAttempt) {
      await prisma.loginAttempt.delete({ where: { ipAddress: ip } }).catch(() => {});
    }

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        shopAccess: (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? ['SHOP_COMPUTER', 'SHOP_XEROX'] : user.shopAccess,
      },
    }, 200, undefined, 'Login successful');
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        shopAccess: true,
        isActive: true,
        createdAt: true,
        customRole: true,
        _count: {
          select: { transactions: true, expenses: true },
        },
      },
    });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    // Calculate total contribution (total revenue generated by this user)
    const totalRevenue = await prisma.transaction.aggregate({
      where: { userId: user.id },
      _sum: { totalPrice: true },
    });

    // Today's stats (IST)
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const todayStart = new Date(`${today}T00:00:00+05:30`);
    const todayEnd = new Date(`${today}T23:59:59.999+05:30`);

    const todayTransactions = await prisma.transaction.aggregate({
      where: {
        userId: req.user!.userId,
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      _sum: { totalPrice: true },
      _count: true,
    });

    const recentLogs = await prisma.log.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        action: true,
        tableName: true,
        createdAt: true,
      },
    });

    const responseData = {
      ...user,
      shopAccess: (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? ['SHOP_COMPUTER', 'SHOP_XEROX'] : user.shopAccess,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      todayStats: {
        transactions: todayTransactions._count,
        revenue: todayTransactions._sum.totalPrice || 0,
      },
      customPermissions: user.customRole?.permissions,
      recentActivity: recentLogs,
    };
    delete (responseData as any).customRole;

    sendSuccess(res, responseData);
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      sendUnauthorized(res, 'Current password is incorrect');
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    sendSuccess(res, null, 200, undefined, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
}

export async function verifyDownload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    if (!username || !password) {
      sendError(res, 'Username and password are required', 400);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() }
    });

    if (!user || !user.isActive || user.isSuspended) {
      sendUnauthorized(res, 'Invalid credentials or account suspended');
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      sendUnauthorized(res, 'Invalid credentials');
      return;
    }

    // Check for Maintenance Mode
    const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
    if (config?.maintenanceMode && user.role !== 'SUPER_ADMIN') {
      res.status(503).json({
        success: false,
        error: config.maintenanceMessage || 'Server is under maintenance. Downloads disabled.',
        maintenance: true
      });
      return;
    }

    // Log the download event (non-blocking)
    try {
      const alert = await prisma.systemAlert.create({
        data: {
          type: 'INFO',
          source: 'SYSTEM',
          message: `User ${user.username} downloaded the Android App.`,
          ipAddress: ip
        }
      });
      socketBroadcast({ type: 'NEW_ALERT', targetRole: 'SUPER_ADMIN', payload: alert });
    } catch (logErr) {
      console.error('[verifyDownload] Failed to log download event:', logErr);
    }

    sendSuccess(res, { apkUrl: '/Shop_RKS_v1.0.27.apk' }, 200, undefined, 'Verification successful. Download started.');
  } catch (err) {
    next(err);
  }
}






export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username } = req.body;
    if (!username) {
      sendError(res, 'Username is required', 400);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() }
    });

    if (!user) {
      // Don't leak if user exists or not
      sendSuccess(res, null, 200, undefined, 'If the username exists, a request has been sent.');
      return;
    }

    await prisma.passwordResetRequest.create({
      data: {
        userId: user.id
      }
    });

    sendSuccess(res, null, 200, undefined, 'Password reset request sent to administrators.');
  } catch (err) {
    next(err);
  }
}

