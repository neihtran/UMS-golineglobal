// ─── IAM API hooks ─────────────────────────────────────────────────────────
// TanStack Query hooks for IAM module endpoints.

import {
  useMutation,
  useQuery,
  useQueries,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  auditLogsApi,
  authApi,
  loginLogsApi,
  permissionsApi,
  rolesApi,
  usersApi,
  profileApi,
  type HqnhatLoginPayload,
} from '@/services/iamApi';
import { useHqnhatAuthStore } from '@/stores/hqnhatAuthStore';
import { useAuthStore } from '@/stores/authStore';
import type {
  AuditLog,
  AuditLogFilters,
  AssignRolePayload,
  ChangePasswordPayload,
  CreateRolePayload,
  CreateUserPayload,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginLog,
  LoginLogFilters,
  PaginatedResponse,
  Permission,
  ResetPasswordPayload,
  Role,
  RoleDetail,
  RoleFilters,
  UpdateProfilePayload,
  UpdateRolePayload,
  UpdateUserPayload,
  User,
  UserFilters,
  VerifyResetTokenPayload,
} from '@/types/iam.types';

// ─── Query Keys ────────────────────────────────────────────────────────────
export const iamKeys = {
  all: ['iam'] as const,
  users: {
    all: () => [...iamKeys.all, 'users'] as const,
    list: (filters: UserFilters) => [...iamKeys.users.all(), 'list', filters] as const,
    detail: (id: number | string) => [...iamKeys.users.all(), 'detail', id] as const,
  },
  roles: {
    all: () => [...iamKeys.all, 'roles'] as const,
    list: (filters: RoleFilters) => [...iamKeys.roles.all(), 'list', filters] as const,
    detail: (id: number | string) => [...iamKeys.roles.all(), 'detail', id] as const,
  },
  permissions: {
    all: () => [...iamKeys.all, 'permissions'] as const,
    list: (params: { module?: string }) => [...iamKeys.permissions.all(), 'list', params] as const,
  },
  auditLogs: {
    all: () => [...iamKeys.all, 'audit-logs'] as const,
    list: (filters: AuditLogFilters) => [...iamKeys.auditLogs.all(), 'list', filters] as const,
    detail: (id: number | string) => [...iamKeys.auditLogs.all(), 'detail', id] as const,
  },
  loginLogs: {
    all: () => [...iamKeys.all, 'login-logs'] as const,
    list: (filters: LoginLogFilters) => [...iamKeys.loginLogs.all(), 'list', filters] as const,
  },
};

// ─── Users ─────────────────────────────────────────────────────────────────
export const useIamUsers = (
  filters: UserFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<User>>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: iamKeys.users.list(filters),
    queryFn: () => usersApi.list(filters).then((r) => r.data),
    ...options,
  });

export const useIamUser = (
  id: number | string | null | undefined,
  options?: Omit<UseQueryOptions<{ success: boolean; message: string; data: User }>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery({
    queryKey: iamKeys.users.detail(id ?? 0),
    queryFn: () => usersApi.get(id!).then((r) => r.data),
    enabled: id != null && id !== '',
    ...options,
  });

// ─── Batch-fetch user roles to avoid N+1 (for list pages) ─────────────────

// Fetches the full User object (which includes roles[]) for each user ID.
// Returns a Map of userId → User (with roles populated).
export const useIamUserRoles = (userIds: number[]) => {
  const results = useQueries({
    queries: userIds.map(id => ({
      queryKey: iamKeys.users.detail(id) as [unknown, ...unknown[]],
      queryFn: () => usersApi.get(id).then(r => r.data.data),
      enabled: userIds.length > 0,
      staleTime: 30_000,
    })),
  });

  const map = new Map<number, User>();
  results.forEach((q, i) => {
    if (q.data) map.set(userIds[i], q.data);
  });
  return { data: map, isLoading: results.some(q => q.isLoading) };
};

export const useCreateIamUser = (
  options?: UseMutationOptions<{ success: boolean; message: string; data: User }, unknown, CreateUserPayload>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: iamKeys.users.all() });
    },
    ...options,
  });
};

export const useUpdateIamUser = (
  options?: UseMutationOptions<{ success: boolean; message: string; data: User }, unknown, { id: number | string; payload: UpdateUserPayload }>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => usersApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: iamKeys.users.all() });
    },
    ...options,
  });
};

export const useDeleteIamUser = (
  options?: UseMutationOptions<unknown, unknown, number | string>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => usersApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: iamKeys.users.all() });
    },
    ...options,
  });
};

export const useLockIamUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => usersApi.lock(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: iamKeys.users.all() }),
  });
};

export const useSuspendIamUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => usersApi.suspend(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: iamKeys.users.all() }),
  });
};

export const useActivateIamUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => usersApi.activate(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: iamKeys.users.all() }),
  });
};

export const useResetIamUserPassword = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => usersApi.resetPassword(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: iamKeys.users.all() }),
  });
};

export const useAssignIamUserRoles = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: AssignRolePayload }) =>
      usersApi.assignRoles(id, payload).then((r) => {
        console.log('[assignRoles] success:', { id, payload, response: r.data });
        return r.data;
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: iamKeys.users.all() }),
    onError: (err: any) => {
      console.error('[assignRoles] error:', {
        status: err?.response?.status,
        url: err?.config?.url,
        method: err?.config?.method,
        data: err?.config?.data,
        response: err?.response?.data,
      });
    },
  });
};

// ─── Roles ─────────────────────────────────────────────────────────────────
export const useIamRoles = (
  filters: RoleFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<Role>>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: iamKeys.roles.list(filters),
    queryFn: () => rolesApi.list(filters).then((r) => r.data),
    ...options,
  });

export const useIamRole = (
  id: number | string | null | undefined,
  options?: Omit<UseQueryOptions<{ success: boolean; message: string; data: RoleDetail }>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery({
    queryKey: iamKeys.roles.detail(id ?? 0),
    queryFn: () => rolesApi.get(id!).then((r) => r.data),
    enabled: id != null && id !== '',
    ...options,
  });

export const useCreateIamRole = (
  options?: UseMutationOptions<{ success: boolean; message: string; data: Role }, unknown, CreateRolePayload>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => rolesApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: iamKeys.roles.all() });
    },
    ...options,
  });
};

export const useUpdateIamRole = (
  options?: UseMutationOptions<{ success: boolean; message: string; data: Role }, unknown, { id: number | string; payload: UpdateRolePayload }>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => rolesApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: iamKeys.roles.all() });
    },
    ...options,
  });
};

export const useDeleteIamRole = (
  options?: UseMutationOptions<unknown, unknown, number | string>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => rolesApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: iamKeys.roles.all() });
    },
    ...options,
  });
};

// ─── Permissions ───────────────────────────────────────────────────────────
// API trả về data grouped by module: { users: [], roles: [], system: [], ... }
export interface PermissionsGroupedResult {
  success: boolean;
  message: string;
  data: Record<string, Permission[]>;
}

export const useIamPermissions = (
  params: { module?: string; search?: string; per_page?: number; page?: number } = {},
  options?: Omit<UseQueryOptions<PermissionsGroupedResult>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: iamKeys.permissions.list(params),
    queryFn: () => permissionsApi.list(params).then((r) => r.data),
    ...options,
  });

// ─── Audit Logs ────────────────────────────────────────────────────────────
export const useIamAuditLogs = (
  filters: AuditLogFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<AuditLog>>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: iamKeys.auditLogs.list(filters),
    queryFn: () => auditLogsApi.list(filters).then((r) => r.data),
    ...options,
  });

export const useIamAuditLog = (
  id: number | string | null | undefined,
  options?: Omit<UseQueryOptions<{ success: boolean; message: string; data: AuditLog }>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery({
    queryKey: iamKeys.auditLogs.detail(id ?? 0),
    queryFn: () => auditLogsApi.get(id!).then((r) => r.data),
    enabled: id != null && id !== '',
    ...options,
  });

// ─── Login Logs ────────────────────────────────────────────────────────────
export const useIamLoginLogs = (
  filters: LoginLogFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<LoginLog>>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: iamKeys.loginLogs.list(filters),
    queryFn: () => loginLogsApi.list(filters).then((r) => r.data),
    ...options,
  });

// ─── Profile ───────────────────────────────────────────────────────────────
export const useIamProfile = () =>
  useQuery({
    queryKey: [...iamKeys.all, 'profile'] as const,
    queryFn: () => profileApi.get().then((r) => r.data),
  });

export const useUpdateIamProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.update(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...iamKeys.all, 'profile'] as const });
    },
  });
};

export const useIamMyPermissions = () =>
  useQuery({
    queryKey: [...iamKeys.all, 'profile', 'permissions'] as const,
    queryFn: () => profileApi.getPermissions().then((r) => r.data),
  });

// ─── Auth ──────────────────────────────────────────────────────────────────
export const useHqnhatLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: HqnhatLoginPayload) => {
      const res = await authApi.login(payload);
      // res.data = HqnhatLoginResponse = { success, message, data: { access_token, user } }
      const inner = res.data?.data;
      const accessToken = inner?.access_token;
      const user = inner?.user;
      const username = user?.username ?? payload.username;
      if (!accessToken) {
        throw new Error(res.data?.message || 'Phản hồi đăng nhập không hợp lệ');
      }
      useHqnhatAuthStore.getState().setCredentials(accessToken, username, user?.roles ?? []);
      return res.data;
    },
    onSuccess: async () => {
      // Invalidate all IAM queries so they re-fetch with the new token
      qc.invalidateQueries({ queryKey: iamKeys.all });
      // Fetch profile lấy roles chuẩn (response login có thể thiếu roles)
      try {
        const profileRes = await profileApi.get();
        const roles = profileRes.data?.data?.roles ?? [];
        if (roles.length > 0) {
          useHqnhatAuthStore.getState().setRoles(roles);
        }
      } catch {
        // ignore — login vẫn thành công
      }
    },
  });
};

export const useHqnhatLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch {
        // Bỏ qua lỗi logout API — vẫn clear state local
      }
      useHqnhatAuthStore.getState().clear();
      useAuthStore.getState().logout();
      qc.clear();
    },
  });
};

export const useIamLogoutAll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logoutAll().then((r) => r.data),
    onSuccess: () => {
      // Sau logout-all: clear client state + chuyển về login
      useHqnhatAuthStore.getState().clear();
      useAuthStore.getState().logout();
      qc.clear();
      window.location.href = '/auth/login';
    },
  });
};

// ─── Forgot Password Flow ──────────────────────────────────────────────────
export const useForgotPassword = () =>
  useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      authApi.forgotPassword(payload).then((r) => r.data as unknown as ForgotPasswordResponse),
  });

export const useVerifyResetToken = () =>
  useMutation({
    mutationFn: (payload: VerifyResetTokenPayload) =>
      authApi.verifyResetToken(payload).then((r) => r.data),
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      authApi.resetPassword(payload).then((r) => r.data),
  });

// ─── Profile Change Password ───────────────────────────────────────────────
export const useChangePassword = () =>
  useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      profileApi.changePassword(payload).then((r) => r.data),
  });