import type { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../../services/token.service';
import * as chatService from './chat.service';

export function initializeChatGateway(io: Server) {
  // Auth middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.data.userId}`);

    socket.on('join-match', ({ matchId }: { matchId: string }) => {
      socket.join(`match:${matchId}`);
    });

    socket.on('leave-match', ({ matchId }: { matchId: string }) => {
      socket.leave(`match:${matchId}`);
    });

    socket.on(
      'send-message',
      async ({ matchId, content, type }: { matchId: string; content: string; type?: string }) => {
        try {
          const message = await chatService.sendMessage(
            socket.data.userId,
            matchId,
            content,
            (type as any) || 'TEXT',
          );

          io.to(`match:${matchId}`).emit('new-message', message);
        } catch (err) {
          socket.emit('error', { message: (err as Error).message });
        }
      },
    );

    socket.on('mark-read', async ({ matchId }: { matchId: string }) => {
      try {
        await chatService.markMessagesRead(socket.data.userId, matchId);
        socket.to(`match:${matchId}`).emit('message-read', {
          matchId,
          readBy: socket.data.userId,
        });
      } catch (err) {
        socket.emit('error', { message: (err as Error).message });
      }
    });

    socket.on('typing-start', ({ matchId }: { matchId: string }) => {
      socket.to(`match:${matchId}`).emit('typing', {
        matchId,
        userId: socket.data.userId,
        isTyping: true,
      });
    });

    socket.on('typing-stop', ({ matchId }: { matchId: string }) => {
      socket.to(`match:${matchId}`).emit('typing', {
        matchId,
        userId: socket.data.userId,
        isTyping: false,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.userId}`);
    });
  });
}
