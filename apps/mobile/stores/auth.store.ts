import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@lehrstellen/shared';

interface AuthUser {
  id: string;
  email: string;
  role: 'STUDENT' | 'COMPANY' | 'ADMIN';
  hasProfile: boolean;
  hasCompletedQuiz: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  clearError: () => void;
}

const TOKEN_KEY = 'lehrstellen_access_token';
const REFRESH_KEY = 'lehrstellen_refresh_token';
const USER_KEY = 'lehrstellen_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      const { accessToken, refreshToken, user } = response.data;

      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      set({
        accessToken,
        refreshToken,
        user,
        isLoading: false,
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Anmeldung fehlgeschlagen';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      const { accessToken, refreshToken, user } = response.data;

      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      set({
        accessToken,
        refreshToken,
        user,
        isLoading: false,
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Registrierung fehlgeschlagen';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch {
      // Ignore secure store errors during logout
    }
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      error: null,
    });
  },

  loadStoredAuth: async () => {
    try {
      const [accessToken, refreshToken, userJson] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);

      if (accessToken && refreshToken && userJson) {
        const user = JSON.parse(userJson) as AuthUser;
        set({
          accessToken,
          refreshToken,
          user,
          isInitialized: true,
        });
      } else {
        set({ isInitialized: true });
      }
    } catch {
      set({ isInitialized: true });
    }
  },

  setUser: (user: AuthUser) => {
    set({ user });
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)).catch(() => {});
  },

  clearError: () => set({ error: null }),
}));
