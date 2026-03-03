import { create } from 'zustand';
import api from '@/lib/api';
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
  logout: () => void;
  loadStoredAuth: () => void;
  setUser: (user: AuthUser) => void;
  clearError: () => void;
}

const TOKEN_KEY = 'lehrstellen_access_token';
const REFRESH_KEY = 'lehrstellen_refresh_token';
const USER_KEY = 'lehrstellen_user';

export const useAuthStore = create<AuthState>((set) => ({
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

      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      set({ accessToken, refreshToken, user, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Anmeldung fehlgeschlagen';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      set({ accessToken, refreshToken, user, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registrierung fehlgeschlagen';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, accessToken: null, refreshToken: null, error: null });
  },

  loadStoredAuth: () => {
    try {
      const accessToken = localStorage.getItem(TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_KEY);
      const userJson = localStorage.getItem(USER_KEY);

      if (accessToken && refreshToken && userJson) {
        const user = JSON.parse(userJson) as AuthUser;
        set({ accessToken, refreshToken, user, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
      set({ isInitialized: true });
    }
  },

  setUser: (user: AuthUser) => {
    set({ user });
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearError: () => set({ error: null }),
}));
