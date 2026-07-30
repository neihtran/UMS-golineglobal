// ─── IAM API Service ───────────────────────────────────────────────────────
// Client wrapper for IAM endpoints at https://api.hqnhat.id.vn/api/v1/iam

import { hqnhatApi } from '@/lib/hqnhatApiClient';
import type {
  ApiResponse,
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
  UpdateRolePayload,
  UpdateUserPayload,
  User,
  UserFilters,
  VerifyResetTokenPayload,
} from '@/types/iam.types';

const BASE = '/api/v1/iam';

// ─── Auth ──────────────────────────────────────────────────────────────────
export const AUTH_LOGIN_PATH = '/api/v1/iam/login';

export interface HqnhatLoginPayload {
  username: string;
  password: string;
}

export interface HqnhatLoginResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    token_type: string;
    user: {
      id: number;
      username: string;
      email: string;
      roles: string[];
    };
  };
}

export const authApi = {
  login: (payload: HqnhatLoginPayload) => {
    // Backend Laravel chỉ parse form-urlencoded cho POST /api/v1/iam/login
    const params = new URLSearchParams();
    params.append('username', payload.username);
    params.append('password', payload.password);
    return hqnhatApi.post<HqnhatLoginResponse>(AUTH_LOGIN_PATH, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },

  logout: () =>
    hqnhatApi.post<ApiResponse<null>>(BASE + '/logout'),

  logoutAll: () =>
    hqnhatApi.post<ApiResponse<null>>(BASE + '/logout-all'),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    hqnhatApi.post<ApiResponse<ForgotPasswordResponse>>(BASE + '/forgot-password', payload),

  verifyResetToken: (payload: VerifyResetTokenPayload) =>
    hqnhatApi.post<ApiResponse<null>>(BASE + '/verify-reset-token', payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    hqnhatApi.post<ApiResponse<null>>(BASE + '/reset-password', payload),
};

// ─── Users ─────────────────────────────────────────────────────────────────
export const usersApi = {
  list: (filters: UserFilters = {}) =>
    hqnhatApi.get<PaginatedResponse<User>>(BASE + '/users', { params: filters }),

  get: (id: number | string) =>
    hqnhatApi.get<ApiResponse<User>>(BASE + '/users/' + id),

  create: (payload: CreateUserPayload) =>
    hqnhatApi.post<ApiResponse<User>>(BASE + '/users', payload),

  update: (id: number | string, payload: UpdateUserPayload) =>
    hqnhatApi.put<ApiResponse<User>>(BASE + '/users/' + id, payload),

  delete: (id: number | string) =>
    hqnhatApi.delete<ApiResponse<null>>(BASE + '/users/' + id),

  resetPassword: (id: number | string) =>
    hqnhatApi.post<ApiResponse<null>>(BASE + '/users/' + id + '/reset-password'),

  lock: (id: number | string) =>
    hqnhatApi.post<ApiResponse<null>>(BASE + '/users/' + id + '/lock'),

  suspend: (id: number | string) =>
    hqnhatApi.post<ApiResponse<null>>(BASE + '/users/' + id + '/suspend'),

  activate: (id: number | string) =>
    hqnhatApi.post<ApiResponse<null>>(BASE + '/users/' + id + '/activate'),

  assignRoles: (id: number | string, payload: AssignRolePayload) =>
    hqnhatApi.put<ApiResponse<User>>(BASE + '/users/' + id + '/roles', payload),

  getPermissionOverrides: (id: number | string) =>
    hqnhatApi.get<ApiResponse<Permission[]>>(BASE + '/users/' + id + '/permission-overrides'),
};

// ─── Roles ─────────────────────────────────────────────────────────────────
export const rolesApi = {
  list: (filters: RoleFilters = {}) =>
    hqnhatApi.get<PaginatedResponse<Role>>(BASE + '/roles', { params: filters }),

  get: (id: number | string) =>
    hqnhatApi.get<ApiResponse<RoleDetail>>(BASE + '/roles/' + id),

  create: (payload: CreateRolePayload) =>
    hqnhatApi.post<ApiResponse<Role>>(BASE + '/roles', payload),

  update: (id: number | string, payload: UpdateRolePayload) =>
    hqnhatApi.put<ApiResponse<Role>>(BASE + '/roles/' + id, payload),

  delete: (id: number | string) =>
    hqnhatApi.delete<ApiResponse<null>>(BASE + '/roles/' + id),
};

// ─── Permissions ───────────────────────────────────────────────────────────
// API trả về object grouped by module (KHÔNG phải flat array).
export interface PermissionsGroupedResponse {
  success: boolean;
  message: string;
  data: Record<string, Permission[]>;
}

export const permissionsApi = {
  list: (params: { per_page?: number; page?: number; module?: string; search?: string } = {}) =>
    hqnhatApi.get<PermissionsGroupedResponse>(BASE + '/permissions', { params }),
};

// ─── Audit Logs ────────────────────────────────────────────────────────────
export const auditLogsApi = {
  list: (filters: AuditLogFilters = {}) =>
    hqnhatApi.get<PaginatedResponse<AuditLog>>(BASE + '/audit-logs', { params: filters }),

  get: (id: number | string) =>
    hqnhatApi.get<ApiResponse<AuditLog>>(BASE + '/audit-logs/' + id),
};

// ─── Login Logs ────────────────────────────────────────────────────────────
export const loginLogsApi = {
  list: (filters: LoginLogFilters = {}) =>
    hqnhatApi.get<PaginatedResponse<LoginLog>>(BASE + '/login-logs', { params: filters }),
};

export interface UpdateProfilePayload {
  avatar?: File;
  preferred_language?: string;
  timezone?: string;
}

// ─── Profile (current user) ───────────────────────────────────────────────
export const profileApi = {
  get: () => hqnhatApi.get<ApiResponse<User>>(BASE + '/profile'),
  update: (payload: UpdateProfilePayload) => {
    const fd = new FormData();
    if (payload.avatar) fd.append('file', payload.avatar);
    if (payload.preferred_language != null) fd.append('preferred_language', payload.preferred_language);
    if (payload.timezone != null) fd.append('timezone', payload.timezone);
    return hqnhatApi.post<ApiResponse<User>>(BASE + '/profile', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getPermissions: () =>
    hqnhatApi.get<ApiResponse<Permission[]>>(BASE + '/profile/permissions'),
  changePassword: (payload: ChangePasswordPayload) =>
    hqnhatApi.post<ApiResponse<null>>(BASE + '/profile/change-password', payload),
};

export default {
  authApi,
  usersApi,
  rolesApi,
  permissionsApi,
  auditLogsApi,
  loginLogsApi,
  profileApi,
};