/// <reference types="vite/client" />
/**
 * Axios API client — single instance used by all service files.
 * Configures base URL, auth headers, and global error handling.
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

export const API_BASE_URL =
  (import.meta.env['VITE_API_URL'] as string | undefined) || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor: attach JWT ─────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401, token refresh, global errors ──────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ success: false; error: { code: string; message: string } }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 — attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      const accessToken = useAuthStore.getState().accessToken;

      // Skip token refresh for dev/mock tokens (no backend validation)
      if (accessToken === 'dev-token' || accessToken?.startsWith('mock-')) {
        return Promise.reject(error);
      }

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const newAccessToken = data.data?.accessToken;

          if (newAccessToken) {
            useAuthStore.getState().setAccessToken(newAccessToken);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return apiClient(originalRequest);
          }
        } catch {
          // Refresh failed — logout
          useAuthStore.getState().logout();
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// ─── Typed error extractor ─────────────────────────────────────────────────────
export function getApiErrorMessage(error: unknown, fallback = 'Đã xảy ra lỗi'): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error?.message ||
      error.message ||
      fallback
    );
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
