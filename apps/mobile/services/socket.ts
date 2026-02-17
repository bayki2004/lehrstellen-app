import { io, Socket } from 'socket.io-client';
import type { WsClientEvents, WsServerEvents } from '@lehrstellen/shared';

const SOCKET_URL = 'http://192.168.0.15:3000';

let socket: Socket<WsServerEvents, WsClientEvents> | null = null;

export function createSocket(token: string): Socket<WsServerEvents, WsClientEvents> {
  if (socket?.connected) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  }) as Socket<WsServerEvents, WsClientEvents>;

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error.message);
  });

  return socket;
}

export function getSocket(): Socket<WsServerEvents, WsClientEvents> | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
