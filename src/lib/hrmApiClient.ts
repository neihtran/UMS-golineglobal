// ─── HRM API Client ─────────────────────────────────────────────────────────
// Dedicated axios instance for the HRM Module API on HQNhat platform
// Base URL: https://api.hqnhat.id.vn/api/v1/hrm
// Uses Bearer token from hqnhatAuthStore (same as IAM module)

import axios, { AxiosError } from 'axios';
import type { ErrorResponse } from '@/types/api.types';
import { getHqnhatToken, clearHqnhatToken } from '@/stores/hqnhatAuthStore';

const HRM_API_BASE_URL =
  import.meta.env.VITE_HQNHAT_API_BASE_URL
    ? `${import.meta.env.VITE_HQNHAT_API_BASE_URL}/api/v1`
    : 'https://api.hqnhat.id.vn/api/v1';

export const hrmApiClient = axios.create({
  baseURL: HRM_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

// Attach Bearer token from hqnhat auth store (same as IAM)
hrmApiClient.interceptors.request.use((config) => {
  const token = getHqnhatToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalise error messages
hrmApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    const status = error.response?.status;
    const data = error.response?.data as any;

    let apiMessage: string;
    if (data?.errors && typeof data.errors === 'object') {
      // Laravel validation error: { errors: { field: ["message"] } }
      const firstField = Object.keys(data.errors)[0];
      const firstError = data.errors[firstField]?.[0];
      apiMessage = firstError || data.message || 'Dữ liệu không hợp lệ.';
    } else if (data?.message) {
      apiMessage = data.message;
    } else if (data?.error?.message) {
      apiMessage = data.error.message;
    } else if (status === 401) {
      apiMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      apiMessage = 'Bạn không có quyền thực hiện thao tác này.';
    } else if (status === 404) {
      apiMessage = 'Không tìm thấy dữ liệu.';
    } else if (status === 422) {
      apiMessage = 'Dữ liệu gửi lên không hợp lệ.';
    } else if (status === 500) {
      apiMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
    } else if (status === 0) {
      apiMessage = 'Không thể kết nối tới máy chủ.';
    } else {
      apiMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';
    }

    if (status === 401) {
      clearHqnhatToken();
    }

    return Promise.reject(
      Object.assign(new Error(apiMessage), {
        status,
        originalError: error,
      })
    );
  }
);

export const hrmApi = {
  get: <T = any>(url: string, config?: Parameters<typeof hrmApiClient.get>[1]) =>
    hrmApiClient.get<T>(url, config),

  post: <T = any>(
    url: string,
    data?: any,
    config?: Parameters<typeof hrmApiClient.post>[2]
  ) => hrmApiClient.post<T>(url, data, config),

  put: <T = any>(
    url: string,
    data?: any,
    config?: Parameters<typeof hrmApiClient.put>[2]
  ) => hrmApiClient.put<T>(url, data, config),

  patch: <T = any>(
    url: string,
    data?: any,
    config?: Parameters<typeof hrmApiClient.patch>[2]
  ) => hrmApiClient.patch<T>(url, data, config),

  delete: <T = any>(
    url: string,
    config?: Parameters<typeof hrmApiClient.delete>[1]
  ) => hrmApiClient.delete<T>(url, config),
};

export default hrmApiClient;
