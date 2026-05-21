import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess, sendError } from '../../utils/response';
import si from 'systeminformation';
import { socketBroadcast } from '../../config/socket';

export async function getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
    sendSuccess(res, config);
  } catch (err) { next(err); }
}

export async function updateConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { maintenanceMode, maintenanceMessage, serverMessage, broadcastToAll } = req.body;
    
    const config = await prisma.systemConfig.update({
      where: { id: 1 },
      data: {
        ...(maintenanceMode !== undefined && { maintenanceMode }),
        ...(maintenanceMessage !== undefined && { maintenanceMessage }),
        ...(serverMessage !== undefined && { serverMessage })
      }
    });

    if (maintenanceMode === true) {
      const activeSessions = await prisma.session.findMany({
        where: { logoutTime: null, isKicked: false, user: { role: 'USER' } }
      });
      
      await prisma.session.updateMany({
        where: { id: { in: activeSessions.map(s => s.id) } },
        data: { isKicked: true }
      });

      socketBroadcast({ 
        type: 'KICK', 
        message: 'System is going into maintenance mode.',
        excludeRole: 'SUPER_ADMIN'
      });
    }

    if (serverMessage) {
      socketBroadcast({ 
        type: 'MESSAGE', 
        message: serverMessage,
        excludeRole: broadcastToAll ? undefined : 'SUPER_ADMIN' 
      });
    }

    sendSuccess(res, config);
  } catch (err) { next(err); }
}

export async function getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessions = await prisma.session.findMany({
      where: { logoutTime: null, isKicked: false },
      include: { user: { select: { id: true, name: true, username: true, role: true } } },
      orderBy: { lastSeen: 'desc' }
    });
    sendSuccess(res, sessions);
  } catch (err) { next(err); }
}

export async function kickSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { timeout } = req.body;

    const session = await prisma.session.update({
      where: { id },
      data: { isKicked: true },
      include: { user: true }
    });

    if (timeout && timeout > 0) {
      const bannedUntil = new Date(Date.now() + Number(timeout) * 60000);
      await prisma.user.update({
        where: { id: session.userId },
        data: { bannedUntil }
      });
    }

    socketBroadcast({ 
      type: 'KICK', 
      message: timeout ? `You have been kicked for ${timeout} minutes.` : 'You have been kicked by an administrator.',
      userId: session.userId 
    });

    sendSuccess(res, null, 200, undefined, 'Session kicked successfully');
  } catch (err) { next(err); }
}

export async function messageUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;
    const { message } = req.body;

    socketBroadcast({
      type: 'MESSAGE',
      message,
      userId
    });

    sendSuccess(res, null, 200, undefined, 'Message sent successfully');
  } catch (err) { next(err); }
}

export async function getSystemHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [cpu, mem, fs, net, time] = await Promise.all([
      si.cpuCurrentSpeed(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.time()
    ]);

    const stats = {
      status: 'Healthy',
      uptime: process.uptime(),
      cpuUsage: cpu.avg,
      memUsage: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        percent: (mem.used / mem.total) * 100
      },
      diskUsage: fs[0] ? {
        size: fs[0].size,
        used: fs[0].used,
        available: fs[0].available,
        percent: fs[0].use
      } : null,
      network: net[0] ? {
        rx: net[0].rx_bytes,
        tx: net[0].tx_bytes,
        status: net[0].operstate
      } : null,
      timestamp: time.current
    };

    sendSuccess(res, stats);
  } catch (err) { next(err); }
}

export function eventStream(req: Request, res: Response): void {
  sendError(res, 'SSE is deprecated. Use Socket.IO instead.', 410);
}
