import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

import Constants from 'expo-constants';
import { Platform } from 'react-native';

// In Expo Go, use the debuggerHost (your Mac's IP) so the device can reach the API.
// Falls back to localhost for web or CI.
const devHost = Constants.expoConfig?.hostUri?.split(':')[0]
  ?? (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
const API_BASE_URL = `http://${devHost}:3002/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased to 60s to handle slow database responses
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach auth token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Retry logic for network errors or 5xx server errors (idempotent methods only)
    if (
      !originalRequest._retry &&
      (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.response?.status >= 500) &&
      originalRequest.method &&
      ['get', 'head', 'options'].includes(originalRequest.method.toLowerCase())
    ) {
      originalRequest._retry = true;
      console.log('Retrying request due to network error/timeout...', originalRequest.url);
      return api(originalRequest);
    }

    // Handle 401 with token refresh — skip for auth endpoints (login/register handle their own errors)
    const isAuthRequest = originalRequest.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;

      const { refreshToken, logout } = useAuthStore.getState();

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data;

        // Update in-memory state and persist to SecureStore
        const { setTokens } = useAuthStore.getState();
        setTokens(newAccessToken, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }

    console.warn('[API Error]', {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
    });

    return Promise.reject(error);
  },
);

export default api;
