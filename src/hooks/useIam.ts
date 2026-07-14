import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { useNotificationStore } from '@/stores/notificationStore';
import type { ApiResponse, PaginatedResponse } from '@/types/common.types';

// ─── Types ────────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  email: string;
  username?: string;
  displayName: string;
  role: string;
  department?: { _id: string; name: string };
  title?: string;
  phone?: string;
  status: 'active' | 'locked' | 'inactive' | 'pending';
  mfaEnabled?: boolean;
  mfaMethod?: string;
  lastLogin?: string;
  failedLoginAttempts?: number;
  lockReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  displayName: string;
  role: string;
  department?: string;
  title?: string;
  phone?: string;
  sendWelcome?: boolean;
  mfaRequired?: boolean;
}

export interface UpdateUserInput {
  displayName?: string;
  role?: string;
  department?: string;
  title?: string;
  phone?: string;
  status?: string;
}

// ─── Queries ────────────────────────────────────────────────────────────────────
export const useUserList = (filters?: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['iam', 'users', 'list', filters],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<User>>('/iam/users', {
        params: filters,
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useUserDetail = (id: string) => {
  return useQuery({
    queryKey: ['iam', 'users', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<User>>(`/iam/users/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['iam', 'users', 'stats'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>('/iam/users/stats');
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useAuditLogs = (filters?: {
  page?: number;
  pageSize?: number;
  userId?: string;
  action?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['iam', 'audit-logs', filters],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<any>>('/iam/audit-logs', {
        params: filters,
      });
      return response.data;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
};

// ─── Mutations ──────────────────────────────────────────────────────────────────
export const useCreateUser = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const response = await api.post<ApiResponse<User>>('/iam/users', data);
      return response.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['iam', 'users'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Tài khoản đã được tạo thành công',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error.response?.data?.message || 'Không thể tạo tài khoản',
      });
    },
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserInput }) => {
      const response = await api.patch<ApiResponse<User>>(`/iam/users/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['iam', 'users'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Tài khoản đã được cập nhật',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error.response?.data?.message || 'Không thể cập nhật tài khoản',
      });
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/iam/users/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['iam', 'users'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Tài khoản đã được xóa',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error.response?.data?.message || 'Không thể xóa tài khoản',
      });
    },
  });
};

export const useLockUser = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      await api.post<ApiResponse<void>>(`/iam/users/${id}/lock`, { reason });
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['iam', 'users'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Tài khoản đã bị khóa',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error.response?.data?.message || 'Không thể khóa tài khoản',
      });
    },
  });
};

export const useUnlockUser = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.post<ApiResponse<void>>(`/iam/users/${id}/unlock`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['iam', 'users'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Tài khoản đã được mở khóa',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error.response?.data?.message || 'Không thể mở khóa tài khoản',
      });
    },
  });
};

export const useResetPassword = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({ id, newPassword }: { id: string; newPassword?: string }) => {
      await api.post<ApiResponse<void>>(`/iam/users/${id}/reset-password`, { newPassword });
    },
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Mật khẩu đã được đặt lại',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error.response?.data?.message || 'Không thể đặt lại mật khẩu',
      });
    },
  });
};

// ─── MFA Mutations ──────────────────────────────────────────────────────────────
export const useSetupMfa = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.post<ApiResponse<{ secret: string; qrCode: string }>>(`/auth/mfa/setup`);
      return response.data;
    },
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'MFA đã được thiết lập',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error.response?.data?.message || 'Không thể thiết lập MFA',
      });
    },
  });
};

export const useEnableMfa = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({ userId, code }: { userId: string; code: string }) => {
      await api.post<ApiResponse<void>>(`/auth/mfa/enable`, { code });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['iam', 'users'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'MFA đã được bật thành công',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error.response?.data?.message || 'Mã MFA không hợp lệ',
      });
    },
  });
};

export const useDisableMfa = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (userId: string) => {
      await api.post<ApiResponse<void>>(`/iam/users/${userId}/disable-mfa`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['iam', 'users'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'MFA đã được tắt',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error.response?.data?.message || 'Không thể tắt MFA',
      });
    },
  });
};
