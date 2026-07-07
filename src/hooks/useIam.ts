/**
 * useIam — TanStack Query hooks for IAM module
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  iamService,
  type User as IamUser,
  type ApiKey,
  type AuditLog,
} from '@/services/iam.service';
import type { UserListResponse } from '@/services/iam.service';
import { useNotificationStore } from '@/stores/notificationStore';

// Normalize backend User shape (_id → id) to match frontend User type
export interface NormalizedUser {
  _id: string;
  id: string;
  email: string;
  displayName: string;
  role: string;
  avatar: string | null;
  permissions: string[];
  unit?: string;
  department?: { _id: string; name: string; code?: string };
  lastLogin?: string;
  mfaEnabled?: boolean;
  mfaMethod?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function normalizeUser(raw: IamUser): NormalizedUser {
  return {
    _id: raw._id,
    id: raw._id,
    email: raw.email,
    displayName: raw.displayName ?? raw.email.split('@')[0],
    role: raw.role,
    avatar: raw.avatar ?? null,
    permissions: [],
    unit: raw.unit ?? raw.department?.name,
    department: raw.department,
    lastLogin: raw.lastLogin,
    mfaEnabled: raw.mfaEnabled,
    mfaMethod: raw.mfaMethod,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export const useUserList = (filters: Parameters<typeof iamService.getUsers>[0] = {}) =>
  useQuery<{ success: boolean; data: NormalizedUser[]; pagination: UserListResponse['pagination'] }>({
    queryKey: ['iam', 'users', 'list', filters],
    queryFn: async () => {
      const r = await iamService.getUsers(filters);
      if (!r.data.success) return r.data as any;
      return {
        success: r.data.success,
        data: r.data.data.map(normalizeUser),
        pagination: r.data.pagination,
      };
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    placeholderData: (prev) => prev,
  });

export const useUserById = (id: string) =>
  useQuery({
    queryKey: ['iam', 'users', id],
    queryFn: () =>
      iamService.getUserById(id).then(
        (r) =>
          r.data.success ? normalizeUser(r.data.data) : r.data.data
      ),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore((s) => s.addNotification);
  return useMutation({
    mutationFn: iamService.createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['iam', 'users'] });
      notify({ type: 'success', title: 'Tạo người dùng thành công', message: 'Người dùng đã được tạo.' });
    },
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore((s) => s.addNotification);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      iamService.updateUser(id, data),
    onSuccess: (_result, vars) => {
      qc.invalidateQueries({ queryKey: ['iam', 'users'] });
      qc.setQueryData(['iam', 'users', vars.id], _result.data);
      notify({ type: 'success', title: 'Cập nhật thành công', message: 'Thông tin người dùng đã được lưu.' });
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore((s) => s.addNotification);
  return useMutation({
    mutationFn: iamService.deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['iam', 'users'] });
      notify({ type: 'success', title: 'Xóa thành công', message: 'Người dùng đã bị xóa.' });
    },
  });
};

export const useLockUser = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore((s) => s.addNotification);
  return useMutation({
    mutationFn: iamService.lockUser,
    onMutate: async (userId) => {
      await qc.cancelQueries({ queryKey: ['iam', 'users'] });
      const prev = qc.getQueriesData({ queryKey: ['iam', 'users'] });
      prev.forEach(([key, value]) => {
        if (value && typeof value === 'object' && 'data' in value) {
          const typed = value as { data: { success: boolean; data: any[]; pagination: any } };
          if (typed.data?.data) {
            qc.setQueryData(key, {
              ...typed,
              data: {
                ...typed.data,
                data: typed.data.data.map((u: any) =>
                  u._id === userId ? { ...u, status: 'locked' } : u,
                ),
              },
            });
          }
        }
      });
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) {
        ctx.prev.forEach(([key, value]) => qc.setQueryData(key, value));
      }
      notify({ type: 'error', title: 'Không thể khóa tài khoản', message: 'Đã xảy ra lỗi khi khóa tài khoản.' });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['iam', 'users'] });
    },
    onSuccess: () => {
      notify({ type: 'success', title: 'Đã khóa tài khoản', message: 'Tài khoản đã bị khóa thành công.' });
    },
  });
};

export const useUnlockUser = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore((s) => s.addNotification);
  return useMutation({
    mutationFn: iamService.unlockUser,
    onMutate: async (userId) => {
      await qc.cancelQueries({ queryKey: ['iam', 'users'] });
      const prev = qc.getQueriesData({ queryKey: ['iam', 'users'] });
      prev.forEach(([key, value]) => {
        if (value && typeof value === 'object' && 'data' in value) {
          const typed = value as { data: { success: boolean; data: any[]; pagination: any } };
          if (typed.data?.data) {
            qc.setQueryData(key, {
              ...typed,
              data: {
                ...typed.data,
                data: typed.data.data.map((u: any) =>
                  u._id === userId ? { ...u, status: 'active' } : u,
                ),
              },
            });
          }
        }
      });
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) {
        ctx.prev.forEach(([key, value]) => qc.setQueryData(key, value));
      }
      notify({ type: 'error', title: 'Không thể mở khóa tài khoản', message: 'Đã xảy ra lỗi khi mở khóa tài khoản.' });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['iam', 'users'] });
    },
    onSuccess: () => {
      notify({ type: 'success', title: 'Đã mở khóa tài khoản', message: 'Tài khoản đã được kích hoạt trở lại.' });
    },
  });
};

export const useResetPassword = () => {
  const notify = useNotificationStore((s) => s.addNotification);
  return useMutation({
    mutationFn: iamService.resetPassword,
    onSuccess: () => {
      notify({ type: 'success', title: 'Reset mật khẩu', message: 'Mật khẩu mới đã được gửi qua email.' });
    },
  });
};

// ─── API Key Hooks ─────────────────────────────────────────────────────────────

export const useApiKeys = () =>
  useQuery<{ success: boolean; data: ApiKey[] }>({
    queryKey: ['iam', 'api-keys'],
    queryFn: () => iamService.getApiKeys().then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });

export const useCreateApiKey = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore((s) => s.addNotification);
  return useMutation({
    mutationFn: iamService.createApiKey,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['iam', 'api-keys'] });
      notify({ type: 'success', title: 'Tạo API Key thành công', message: 'API Key mới đã được tạo.' });
    },
    onError: () => {
      notify({ type: 'error', title: 'Tạo thất bại', message: 'Không thể tạo API Key mới.' });
    },
  });
};

export const useToggleApiKey = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore((s) => s.addNotification);
  return useMutation({
    mutationFn: iamService.toggleApiKey,
    onSuccess: (_result) => {
      qc.invalidateQueries({ queryKey: ['iam', 'api-keys'] });
      const newStatus = _result.data?.data?.status;
      notify({
        type: 'success',
        title: newStatus === 'active' ? 'Đã kích hoạt API Key' : 'Đã tắt API Key',
        message: newStatus === 'active' ? 'API Key đã được kích hoạt trở lại.' : 'API Key đã bị tắt.',
      });
    },
    onError: () => {
      notify({ type: 'error', title: 'Thao tác thất bại', message: 'Không thể thay đổi trạng thái API Key.' });
    },
  });
};

export const useDeleteApiKey = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore((s) => s.addNotification);
  return useMutation({
    mutationFn: iamService.deleteApiKey,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['iam', 'api-keys'] });
      notify({ type: 'success', title: 'Đã xóa API Key', message: 'API Key đã được xóa khỏi hệ thống.' });
    },
    onError: () => {
      notify({ type: 'error', title: 'Xóa thất bại', message: 'Không thể xóa API Key.' });
    },
  });
};

// ─── Session Hooks ─────────────────────────────────────────────────────────────

export const useSessionList = (params?: { page?: number; pageSize?: number; search?: string }) =>
  useQuery({
    queryKey: ['iam', 'sessions', params],
    queryFn: () => iamService.getSessions(params).then((r) => r.data),
    staleTime: 1000 * 30,
  });

export const useRevokeSession = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore((s) => s.addNotification);
  return useMutation({
    mutationFn: iamService.revokeSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['iam', 'sessions'] });
      notify({ type: 'success', title: 'Đã đăng xuất', message: 'Phiên đăng nhập đã bị thu hồi.' });
    },
    onError: () => {
      notify({ type: 'error', title: 'Thao tác thất bại', message: 'Không thể thu hồi phiên đăng nhập.' });
    },
  });
};

export const useRevokeAllSessions = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore((s) => s.addNotification);
  return useMutation({
    mutationFn: iamService.revokeAllSessions,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['iam', 'sessions'] });
      notify({ type: 'success', title: 'Đã đăng xuất tất cả', message: 'Mọi phiên đăng nhập đã bị thu hồi.' });
    },
    onError: () => {
      notify({ type: 'error', title: 'Thao tác thất bại', message: 'Không thể thu hồi các phiên đăng nhập.' });
    },
  });
};

// ─── Audit Log Hooks ────────────────────────────────────────────────────────

export const useAuditLogList = (params?: { page?: number; pageSize?: number; search?: string; module?: string; action?: string; status?: string; userId?: string }) =>
  useQuery({
    queryKey: ['iam', 'audit-logs', params],
    queryFn: () => iamService.getAuditLogs(params).then((r) => r.data),
    staleTime: 1000 * 30,
  });

// ─── Dashboard Hook ─────────────────────────────────────────────────────────

export const useIamDashboard = () =>
  useQuery<{ success: boolean; data: { stats: any; roles: any[]; recentAudit: AuditLog[] } }>({
    queryKey: ['iam', 'dashboard'],
    queryFn: () => iamService.getDashboard().then((r) => r.data),
    staleTime: 1000 * 30,
  });
