import { create } from 'zustand';
import { createSocket, disconnectSocket, getSocket } from '../services/socket';
import type { MessageDTO } from '@lehrstellen/shared';
import type { Socket } from 'socket.io-client';

interface ChatState {
  isConnected: boolean;
  messages: Record<string, MessageDTO[]>;
  activeMatchId: string | null;
  typingUsers: Record<string, boolean>;

  connect: (token: string) => void;
  disconnect: () => void;
  sendMessage: (matchId: string, content: string) => void;
  joinMatch: (matchId: string) => void;
  leaveMatch: (matchId: string) => void;
  addMessage: (message: MessageDTO) => void;
  setMessages: (matchId: string, messages: MessageDTO[]) => void;
  markRead: (matchId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  isConnected: false,
  messages: {},
  activeMatchId: null,
  typingUsers: {},

  connect: (token: string) => {
    const socket = createSocket(token);

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('new-message', (message: MessageDTO) => {
      if (!message?.matchId) return;
      const state = get();
      const matchMessages = state.messages[message.matchId] || [];
      set({
        messages: {
          ...state.messages,
          [message.matchId]: [...matchMessages, message],
        },
      });
    });

    socket.on('typing', ({ matchId, userId, isTyping }) => {
      set((state) => ({
        typingUsers: {
          ...state.typingUsers,
          [`${matchId}_${userId}`]: isTyping,
        },
      }));
    });
  },

  disconnect: () => {
    disconnectSocket();
    set({ isConnected: false });
  },

  sendMessage: (matchId: string, content: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('send-message', { matchId, content, type: 'TEXT' });
    }
  },

  joinMatch: (matchId: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('join-match', { matchId });
    }
    set({ activeMatchId: matchId });
  },

  leaveMatch: (matchId: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('leave-match', { matchId });
    }
    set({ activeMatchId: null });
  },

  addMessage: (message: MessageDTO) => {
    set((state) => {
      const matchMessages = state.messages[message.matchId] || [];
      return {
        messages: {
          ...state.messages,
          [message.matchId]: [...matchMessages, message],
        },
      };
    });
  },

  setMessages: (matchId: string, messages: MessageDTO[]) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: messages,
      },
    }));
  },

  markRead: (matchId: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('mark-read', { matchId });
    }
  },
}));
