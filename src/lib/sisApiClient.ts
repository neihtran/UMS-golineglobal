// ─── SIS API Client ────────────────────────────────────────────────────────────
// Dedicated axios instance for the SIS API
// (https://api.hqnhat.id.vn/api/v1/sis)

import axios, { AxiosError } from 'axios';
import type { ErrorResponse } from '@/types/api.types';

const SIS_API_BASE_URL =
  import.meta.env.VITE_SIS_API_BASE_URL || 'https://api.hqnhat.id.vn';

export const sisApiClient = axios.create({
  baseURL: SIS_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

sisApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    const status = error.response?.status;
    const data = error.response?.data as any;

    let apiMessage: string;
    if (data?.errors && typeof data.errors === 'object') {
      const firstField = Object.keys(data.errors)[0];
      const firstError = data.errors[firstField]?.[0];
      apiMessage = firstError || data.message || 'Dữ liệu không hợp lệ.';
    } else if (data?.message) {
      apiMessage = data.message;
    } else if (data?.error?.message) {
      apiMessage = data.error.message;
    } else if (status === 401) {
      apiMessage = 'Token không hợp lệ hoặc đã hết hạn.';
    } else if (status === 403) {
      apiMessage = 'Bạn không có quyền truy cập.';
    } else if (status === 404) {
      apiMessage = 'Không tìm thấy dữ liệu.';
    } else if (status === 422) {
      apiMessage = 'Dữ liệu gửi lên không hợp lệ.';
    } else if (status === 500) {
      apiMessage = 'API gặp lỗi máy chủ.';
    } else {
      apiMessage = 'Không thể kết nối tới API.';
    }

    return Promise.reject(
      Object.assign(new Error(apiMessage), {
        status,
        originalError: error,
      })
    );
  }
);

export const sisApi = {
  get: <T = any>(url: string, config?: Parameters<typeof sisApiClient.get>[1]) =>
    sisApiClient.get<T>(url, config),

  post: <T = any>(
    url: string,
    data?: any,
    config?: Parameters<typeof sisApiClient.post>[2]
  ) => sisApiClient.post<T>(url, data, config),

  put: <T = any>(
    url: string,
    data?: any,
    config?: Parameters<typeof sisApiClient.put>[2]
  ) => sisApiClient.put<T>(url, data, config),

  delete: <T = any>(url: string, config?: Parameters<typeof sisApiClient.delete>[1]) =>
    sisApiClient.delete<T>(url, config),
};

export default sisApiClient;
