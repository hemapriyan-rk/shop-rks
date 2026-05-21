import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from './env';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Allow all for local Wi-Fi access
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/api/socket.io'
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId, username, role } = socket.data.user;
    console.log(`[SOCKET] User connected: ${username} (${userId})`);

    // Join a private room for this user
    socket.join(`user:${userId}`);
    
    // Join a room for their role
    socket.join(`role:${role}`);

    socket.on('disconnect', () => {
      console.log(`[SOCKET] User disconnected: ${username}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

/**
 * Broadcast message to all or targeted
 */
export const socketBroadcast = (data: { 
  type: string; 
  message?: string; 
  userId?: string; 
  excludeRole?: string;
  payload?: any;
}) => {
  if (!io) return;

  if (data.userId) {
    // Target specific user
    io.to(`user:${data.userId}`).emit('notification', data);
  } else if (data.excludeRole) {
    // Broadcast to everyone EXCEPT specific role
    // We can't easily "exclude" a room in Socket.io 4.x without a loop or specific logic
    // So we'll emit to everyone and handle filtering on frontend OR use rooms
    // Actually, we can use rooms for roles. 
    // For simplicity, let's just emit to all and let client filter if it's simpler
    // OR: emit to all rooms that are NOT the excluded one.
    // For this app, we only have 3 roles.
    const roles = ['USER', 'ADMIN', 'SUPER_ADMIN'];
    roles.forEach(r => {
      if (r !== data.excludeRole) {
        io.to(`role:${r}`).emit('notification', data);
      }
    });
  } else {
    // Global broadcast
    io.emit('notification', data);
  }
};
