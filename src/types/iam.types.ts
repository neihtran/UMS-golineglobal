// ─── IAM API Types ─────────────────────────────────────────────────────────
// Based on https://api.hqnhat.id.vn/docs/iam (api-docs-iam.json)
// Wrapped response shape: { success, message, data, meta? }

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginatedMeta;
}

// ─── Users ─────────────────────────────────────────────────────────────────
// API thực trả status là số: 1 = active, 0 = inactive/locked.
// Roles là string[] (role code), ví dụ ["admin"], KHÔNG phải Role[].
// API trả status là string: "ACTIVE", "LOCKED", "SUSPENDED".
// Backend thực tế trả `roles` trong list response.
export type UserStatusString = 'ACTIVE' | 'LOCKED' | 'SUSPENDED';
// Giữ cả 2 để tương thích
export type UserStatusCode = 0 | 1 | 2;

export interface User {
  id: number;
  username: string | null;
  email: string | null;
  phone?: string | null;
  account_type?: string | null;
  employee_id?: string | null;
  student_id?: string | null;
  status: UserStatusString | UserStatusCode;
  roles: string[];
  profile?: UserProfile | null;
  email_verified_at?: string | null;
  last_login_at?: string | null;
  last_login_ip?: string | null;
  created_at?: string;
  updated_at?: string;
}
  id: number;
  user_id: string;
  avatar?: string | null;
  preferred_language?: string;
  timezone?: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string | null;
  account_type?: 'system' | 'employee' | 'student' | string | null;
  employee_id?: string | null;
  student_id?: string | null;
  status: UserStatusCode;
  roles?: string[];
  profile?: UserProfile | null;
  email_verified_at?: string | null;
  last_login_at?: string | null;
  last_login_ip?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  phone?: string;
  full_name?: string;
  account_type?: string;
  role_codes?: string[];
}

export interface UpdateUserPayload {
  email?: string;
  phone?: string;
  full_name?: string;
  account_type?: string;
  status?: UserStatusString | UserStatusCode;
}

// ─── Roles ─────────────────────────────────────────────────────────────────
// Role list trả permissions_count (number), detail trả permissions_grouped (object).
export type RoleStatusCode = 0 | 1;

export interface Role {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  status: RoleStatusCode;
  permissions_count?: number;
  user_count?: number;  // API trả "user_count" (số ít), không phải "users_count"
  is_system?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Role detail response shape (with grouped permissions).
export interface RoleDetail extends Role {
  permissions_grouped?: Record<string, Permission[]>;
}

// Legacy alias — RoleSheet imports this. Status chỉ là 0|1.
export type RoleStatus = RoleStatusCode;

export interface CreateRolePayload {
  code: string;
  name: string;
  description?: string;
  status: RoleStatusCode;
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  status?: RoleStatusCode;
}

// ─── Permissions ───────────────────────────────────────────────────────────
// Permissions list trả về data là object grouped by module:
// { users: Permission[], roles: Permission[], system: Permission[], ... }
// Mỗi Permission có scopes array (rỗng theo API thực).
export interface Permission {
  id: number;
  code: string;
  name: string;
  module: string;
  description?: string | null;
  scopes?: unknown[];
  status: RoleStatusCode;
}

// ─── Audit Logs ────────────────────────────────────────────────────────────
// API trả action là lowercase: "create" | "update" | "delete" | "login" | ...
// resource_id là string hoặc null.
export interface AuditLog {
  id: number;
  user_id?: string | null;
  module: string;
  action: string;
  resource_type?: string;
  resource_id?: string | null;
  description?: string;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AuditLogFilters {
  page?: number;
  per_page?: number;
  user_id?: string | number;
  module?: string;
  action?: string;
  resource_type?: string;
  resource_id?: string | number;
  from_date?: string;
  to_date?: string;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// ─── Login Logs ────────────────────────────────────────────────────────────
export type LoginMethod = 'password' | 'sso' | 'oauth' | 'mfa' | 'webauthn' | 'magic_link';

export interface LoginLog {
  id: number;
  user_id?: string | null;
  login_method: LoginMethod;
  ip_address?: string;
  user_agent?: string;
  logged_in_at: string;
  logged_out_at?: string | null;
  created_at?: string;
}

export interface LoginLogFilters {
  page?: number;
  per_page?: number;
  user_id?: string | number;
  login_method?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
}

// ─── User Filter Params ────────────────────────────────────────────────────
// Backend hỗ trợ `search` (chung) cho users, và các filter riêng cho username/email/status/account_type.
export interface UserFilters {
  per_page?: number;
  page?: number;
  username?: string;
  email?: string;
  phone?: string;
  status?: UserStatusString | UserStatusCode;
  account_type?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface RoleFilters {
  per_page?: number;
  page?: number;
  code?: string;
  name?: string;
  status?: RoleStatusCode;
}

// ─── Assign Role to User ───────────────────────────────────────────────────
// API PUT /users/{id}/roles nhận roles: string[].
export interface AssignRolePayload {
  roles: string[];
}

// ─── Forgot Password Flow ──────────────────────────────────────────────────
// API yêu cầu `username` (không phải email) cho forgot-password flow.
export interface ForgotPasswordPayload {
  username: string;
}

export interface ForgotPasswordResponse {
  reset_token?: string;
  username?: string;
}

export interface VerifyResetTokenPayload {
  username: string;
  token: string;
}

export interface ResetPasswordPayload {
  username: string;
  token: string;
  password: string;
  password_confirmation: string;
}

// ─── Profile ───────────────────────────────────────────────────────────────
export interface UpdateProfilePayload {
  avatar?: File;
  preferred_language?: string;
  timezone?: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  new_password_confirmation: string;
}