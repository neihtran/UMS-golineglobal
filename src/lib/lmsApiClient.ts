// ─── LMS API Client ───────────────────────────────────────────────────────────
// Dedicated axios instance for LMS Module API on HQNhat platform
// Base URL: https://api.hqnhat.id.vn/api/v1/lms

import axios, { AxiosError } from 'axios';
import type { ErrorResponse } from '@/types/api.types';
import { getHqnhatToken, clearHqnhatToken } from '@/stores/hqnhatAuthStore';

const LMS_API_BASE_URL =
  import.meta.env.VITE_HQNHAT_API_BASE_URL
    ? `${import.meta.env.VITE_HQNHAT_API_BASE_URL}/api/v1`
    : 'https://api.hqnhat.id.vn/api/v1';

const LMS_API_TOKEN = import.meta.env.VITE_HQNHAT_API_TOKEN || '';

export const lmsApiClient = axios.create({
  baseURL: LMS_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 60000,
});

lmsApiClient.interceptors.request.use((config) => {
  // Priority: hqnhatAuthStore token -> env var fallback (for dev bypass)
  const storedToken = getHqnhatToken();
  const token = storedToken || (HQNHAT_API_TOKEN && HQNHAT_API_TOKEN !== 'YOUR_HQNHAT_JWT_TOKEN_HERE' ? HQNHAT_API_TOKEN : null);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

lmsApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    const status = error.response?.status;
    const data = error.response?.data as any;

    let apiMessage: string;
    if (data?.errors && typeof data.errors === 'object') {
      const firstField = Object.keys(data.errors)[0];
      const firstError = data.errors[firstField]?.[0];
      apiMessage = firstError || data?.message || 'Dữ liệu không hợp lệ.';
    } else if (data?.message) {
      apiMessage = data.message;
    } else if (status === 401) {
      apiMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      apiMessage = 'Bạn không có quyền thực hiện thao tác này.';
    } else if (status === 404) {
      apiMessage = 'Không tìm thấy dữ liệu.';
    } else if (status === 422) {
      apiMessage = data?.message || 'Dữ liệu gửi lên không hợp lệ.';
    } else if (status === 500) {
      apiMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
    } else if (status === 0) {
      apiMessage = 'Không thể kết nối tới máy chủ.';
    } else {
      apiMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';
    }

    if (status === 401) clearHqnhatToken();

    return Promise.reject(
      Object.assign(new Error(apiMessage), { status, originalError: error })
    );
  }
);

export const lmsApi = {
  get: <T = any>(url: string, config?: Parameters<typeof lmsApiClient.get>[1]) =>
    lmsApiClient.get<T>(url, config),

  post: <T = any>(
    url: string,
    data?: any,
    config?: Parameters<typeof lmsApiClient.post>[2]
  ) => lmsApiClient.post<T>(url, data, config),

  put: <T = any>(
    url: string,
    data?: any,
    config?: Parameters<typeof lmsApiClient.put>[2]
  ) => lmsApiClient.put<T>(url, data, config),

  delete: <T = any>(url: string, config?: Parameters<typeof lmsApiClient.delete>[1]) =>
    lmsApiClient.delete<T>(url, config),
};

export default lmsApiClient;
