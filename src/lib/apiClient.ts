import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import type { ErrorResponse } from '@/types/api.types';

// API Base URL - change this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Extend InternalAxiosRequestConfig to add _retry flag
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// ─── Request Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from auth store
    const accessToken = useAuthStore.getState().getAccessToken();
    
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── Response Interceptor ────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = useAuthStore.getState().getRefreshToken();
      
      if (refreshToken) {
        try {
          // Try to refresh the token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken } = response.data.data;
          
          // Update token in store
          useAuthStore.getState().setAccessToken(accessToken);
          
          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          useAuthStore.getState().logout();
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No token, redirect to login
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      // Optionally redirect to unauthorized page
      console.error('Access forbidden:', error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

// ─── API Methods ─────────────────────────────────────────────────────────────
export const api = {
  get: <T = any>(url: string, config?: InternalAxiosRequestConfig) =>
    apiClient.get<T>(url, config),
  
  post: <T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig) =>
    apiClient.post<T>(url, data, config),
  
  put: <T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig) =>
    apiClient.put<T>(url, data, config),
  
  patch: <T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config),
  
  delete: <T = any>(url: string, config?: InternalAxiosRequestConfig) =>
    apiClient.delete<T>(url, config),
};

// Export default apiClient for direct use
export default apiClient;
