import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { app } from './app';
import { env } from './config/env';
import { initializeChatGateway } from './modules/chat/chat.gateway';
import { prisma } from '@lehrstellen/database';

const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

initializeChatGateway(io);

httpServer.listen(env.PORT, async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`API running on http://localhost:${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  httpServer.close(() => process.exit(0));
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down...');
  await prisma.$disconnect();
  httpServer.close(() => process.exit(0));
});
