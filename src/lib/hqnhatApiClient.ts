// ─── HQNhat API Client ─────────────────────────────────────────────────────
// Dedicated axios instance for the external HQNhat UMS API
// (https://api.hqnhat.id.vn). Uses Bearer token from (in priority order):
//   1. Local Hqnhat auth store (token issued by /api/v1/iam/login)
//   2. Environment variable (for background scripts / agent access)

import axios, { AxiosError } from 'axios';
import type { ErrorResponse } from '@/types/api.types';
import { clearHqnhatToken, getHqnhatToken } from '@/stores/hqnhatAuthStore';

const HQNHAT_API_BASE_URL =
  import.meta.env.VITE_HQNHAT_API_BASE_URL || 'https://api.hqnhat.id.vn';

const HQNHAT_API_TOKEN = import.meta.env.VITE_HQNHAT_API_TOKEN || '';

export const hqnhatApiClient = axios.create({
  baseURL: HQNHAT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

// Attach Bearer token (priority: hqnhat auth store -> env var)
hqnhatApiClient.interceptors.request.use((config) => {
  if (config.headers) {
    const storedToken = getHqnhatToken();
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    } else if (
      HQNHAT_API_TOKEN &&
      HQNHAT_API_TOKEN !== 'YOUR_HQNHAT_JWT_TOKEN_HERE'
    ) {
      config.headers.Authorization = `Bearer ${HQNHAT_API_TOKEN}`;
    }
  }
  return config;
});

// Normalise error so consumers always get a friendly message
hqnhatApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    const status = error.response?.status;
    const data = error.response?.data as any;

    // Extract detailed error message
    let apiMessage: string;
    if (data?.errors && typeof data.errors === 'object') {
      // Laravel validation error format: { errors: { field: ["message"] } }
      const firstField = Object.keys(data.errors)[0];
      const firstError = data.errors[firstField]?.[0];
      apiMessage = firstError || data.message || 'Dữ liệu không hợp lệ.';
    } else if (data?.message) {
      apiMessage = data.message;
    } else if (data?.error?.message) {
      apiMessage = data.error.message;
    } else if (status === 401) {
      apiMessage = 'Bạn cần đăng nhập vào HQNhat API. Nhấn nút "Đăng nhập HQNhat" ở đầu trang.';
    } else if (status === 403) {
      apiMessage = 'Bạn không có quyền truy cập HQNhat API.';
    } else if (status === 404) {
      apiMessage = 'Endpoint HQNhat không tồn tại.';
    } else if (status === 422) {
      apiMessage = 'Dữ liệu gửi lên HQNhat không hợp lệ.';
    } else if (status === 500) {
      apiMessage = 'HQNhat API gặp lỗi máy chủ.';
    } else {
      apiMessage = 'Không thể kết nối tới HQNhat API.';
    }

    // Auto-logout on 401 so we don't keep retrying with a bad token.
    if (status === 401) {
      clearHqnhatToken();
    }

    if (status === 401 || status === 403) {
      console.warn('[HQNhat auth]', apiMessage);
    }
    return Promise.reject(
      Object.assign(new Error(apiMessage), {
        status,
        originalError: error,
      })
    );
  }
);

export const hqnhatApi = {
  get: <T = any>(url: string, config?: Parameters<typeof hqnhatApiClient.get>[1]) =>
    hqnhatApiClient.get<T>(url, config),

  post: <T = any>(
    url: string,
    data?: any,
    config?: Parameters<typeof hqnhatApiClient.post>[2]
  ) => hqnhatApiClient.post<T>(url, data, config),

  put: <T = any>(
    url: string,
    data?: any,
    config?: Parameters<typeof hqnhatApiClient.put>[2]
  ) => hqnhatApiClient.put<T>(url, data, config),

  delete: <T = any>(url: string, config?: Parameters<typeof hqnhatApiClient.delete>[1]) =>
    hqnhatApiClient.delete<T>(url, config),
};

export default hqnhatApiClient;