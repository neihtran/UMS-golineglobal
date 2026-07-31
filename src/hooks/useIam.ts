import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  User,
  UserFilters,
  RoleFilters,
  AuditLogFilters,
  LoginLogFilters,
  CreateUserPayload,
  UpdateUserPayload,
  CreateRolePayload,
  UpdateRolePayload,
  AssignRolePayload,
  ChangePasswordPayload,
  ResetPasswordPayload,
  ForgotPasswordPayload,
} from '@/types/iam.types';
import {
  authApi,
  usersApi,
  rolesApi,
  permissionsApi,
  auditLogsApi,
  loginLogsApi,
  profileApi,
} from '@/services/iamApi';

export const iamKeys = {
  all: ['iam'] as const,
  users: {
    all: () => [...iamKeys.all, 'users'] as const,
    list: (filters?: UserFilters) => [...iamKeys.users.all(), filters] as const,
    detail: (id: number | string) => [...iamKeys.users.all(), 'detail', id] as const,
  },
  roles: {
    all: () => [...iamKeys.all, 'roles'] as const,
    list: (filters?: RoleFilters) => [...iamKeys.all, 'roles', filters] as const,
    detail: (id: number | string) => [...iamKeys.all, 'roles', 'detail', id] as const,
  },
  permissions: {
    all: () => [...iamKeys.all, 'permissions'] as const,
    list: () => [...iamKeys.permissions.all(), 'list'] as const,
  },
  auditLogs: {
    all: () => [...iamKeys.all, 'auditLogs'] as const,
    list: (filters?: AuditLogFilters) => [...iamKeys.auditLogs.all(), filters] as const,
  },
  loginLogs: {
    all: () => [...iamKeys.all, 'loginLogs'] as const,
    list: (filters?: LoginLogFilters) => [...iamKeys.loginLogs.all(), filters] as const,
  },
};

// ─── Users ─────────────────────────────────────────────────────────────────

export const useIamUsers = (filters: UserFilters = {}) =>
  useQuery({
    queryKey: iamKeys.users.list(filters),
    queryFn: () => usersApi.list(filters).then(r => r.data),
    placeholderData: (prev) => prev,
  });

export const useIamUser = (id: number | string | null) =>
  useQuery({
    queryKey: iamKeys.users.detail(id ?? -1),
    queryFn: () => usersApi.get(id!).then(r => r.data),
    enabled: id != null,
  });

export const useIamUserRoles = (userIds: number[]) => {
  const results = useQueries({
    queries: userIds.map(id => ({
      queryKey: ['iam', 'users', 'detail', id] as [unknown, ...unknown[]],
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

export const useCreateIamUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: iamKeys.users.all() }),
  });
};

export const useUpdateIamUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: iamKeys.users.all() }),
  });
};

export const useDeleteIamUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => usersApi.delete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: iamKeys.users.all() }),
  });
};

export const useAssignIamUserRoles = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: AssignRolePayload }) =>
      usersApi.assignRoles(id, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: iamKeys.users.all() }),
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

// ─── Roles ─────────────────────────────────────────────────────────────────

export const useIamRoles = (filters: RoleFilters = {}, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: iamKeys.roles.list(filters),
    queryFn: () => rolesApi.list(filters).then(r => r.data),
    enabled: options?.enabled ?? true,
  });

export const useIamRole = (id: number | string | null) =>
  useQuery({
    queryKey: iamKeys.roles.detail(id ?? -1),
    queryFn: () => rolesApi.get(id!).then(r => r.data),
    enabled: id != null,
  });

export const useCreateIamRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => rolesApi.create(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: iamKeys.roles.all() }),
  });
};

export const useUpdateIamRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UpdateRolePayload }) =>
      rolesApi.update(id, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: iamKeys.roles.all() }),
  });
};

export const useDeleteIamRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => rolesApi.delete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: iamKeys.roles.all() }),
  });
};

// ─── Permissions ────────────────────────────────────────────────────────────

export const useIamPermissions = () =>
  useQuery({
    queryKey: iamKeys.permissions.list(),
    queryFn: () => permissionsApi.list().then(r => r.data),
  });

// ─── Audit Logs ────────────────────────────────────────────────────────────

export const useIamAuditLogs = (
  filters: AuditLogFilters = {},
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: iamKeys.auditLogs.list(filters),
    queryFn: () => auditLogsApi.list(filters).then(r => r.data),
    enabled: options?.enabled ?? true,
  });

// ─── Login Logs ────────────────────────────────────────────────────────────

export const useIamLoginLogs = (
  filters: LoginLogFilters = {},
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: iamKeys.loginLogs.list(filters),
    queryFn: () => loginLogsApi.list(filters).then(r => r.data),
    enabled: options?.enabled ?? true,
  });

// ─── Auth / Forgot Password ────────────────────────────────────────────────

export const useForgotPassword = () =>
  useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authApi.forgotPassword(payload).then((r) => r.data),
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authApi.resetPassword(payload).then((r) => r.data),
  });

export const useVerifyResetToken = () =>
  useMutation({
    mutationFn: (payload: import('@/types/iam.types').VerifyResetTokenPayload) =>
      authApi.verifyResetToken(payload).then((r) => r.data),
  });

export const useIamLogoutAll = () =>
  useMutation({
    mutationFn: () => authApi.logoutAll().then((r) => r.data),
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
    mutationFn: (payload: Parameters<typeof profileApi.update>[0] extends infer T ? T : never) =>
      profileApi.update(payload as Parameters<typeof profileApi.update>[0]).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...iamKeys.all, 'profile'] as const });
    },
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: (payload: ChangePasswordPayload) => profileApi.changePassword(payload).then((r) => r.data),
  });

export const useIamMyPermissions = () =>
  useQuery({
    queryKey: [...iamKeys.all, 'profile', 'permissions'] as const,
    queryFn: () => profileApi.getPermissions().then((r) => r.data),
  });

// Alias for components that import useIamAuditLog (singular)
export const useIamAuditLog = (filters: AuditLogFilters = {}, options?: { enabled?: boolean }) =>
  useIamAuditLogs(filters, options);

// Alias
export const useHqnhatLogout = () => useIamLogoutAll();
