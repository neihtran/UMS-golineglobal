/**
 * IAM service — User management, API key, session & audit API calls
 */
import { apiClient } from '@/lib/apiClient';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  role: string;
  unit?: string;
  department?: { _id: string; name: string; code?: string };
  status: 'active' | 'locked' | 'pending' | 'inactive';
  lastLogin?: string;
  mfaEnabled?: boolean;
  mfaMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
  department?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface UserListResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiKey {
  _id: string;
  name: string;
  description: string;
  keyPreview: string;
  createdBy: string;
  createdAt: string;
  lastUsed: string;
  scopes: string[];
  status: 'active' | 'inactive' | 'revoked';
  usage: number;
  dailyLimit: number;
}

export interface Session {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  loginTime: string;
  lastActivity: string;
  status: 'active' | 'expired' | 'locked';
  isCurrent: boolean;
}

export interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  module: string;
  description: string;
  ip: string;
  userAgent?: string;
  status: 'success' | 'failure' | 'warning';
  resource?: string;
  resourceId?: string;
  details?: string;
  timestamp: string;
}

// ─── IAM Service ──────────────────────────────────────────────────────────────

export const iamService = {
  // Users
  getUsers: (filters: UserFilters = {}) =>
    apiClient.get<UserListResponse>('/users', { params: filters }),

  getUserById: (id: string) =>
    apiClient.get<{ success: boolean; data: User }>(`/users/${id}`),

  createUser: (data: Partial<User>) =>
    apiClient.post<{ success: boolean; data: User }>('/users', data),

  updateUser: (id: string, data: Partial<User>) =>
    apiClient.patch<{ success: boolean; data: User }>(`/users/${id}`, data),

  deleteUser: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/users/${id}`),

  lockUser: (id: string) =>
    apiClient.post<{ success: boolean; message: string }>(`/users/${id}/lock`),

  unlockUser: (id: string) =>
    apiClient.post<{ success: boolean; message: string }>(`/users/${id}/unlock`),

  resetPassword: (id: string) =>
    apiClient.post<{ success: boolean; message: string }>(`/users/${id}/reset-password`),

  getDashboard: () =>
    apiClient.get<{
      success: boolean;
      data: {
        stats: { totalUsers: number; activeUsers: number; lockedUsers: number; loginsToday: number; activePercent: string };
        roles: Array<{ name: string; users: number; color: string; icon: string; active: boolean; perms: string[]; matrix: boolean[] }>;
        recentAudit: AuditLog[];
      };
    }>('/iam/dashboard'),

  // API Keys
  getApiKeys: () =>
    apiClient.get<{ success: boolean; data: ApiKey[] }>('/api-keys'),

  createApiKey: (data: { name: string; description: string; scopes: string[] }) =>
    apiClient.post<{ success: boolean; data: ApiKey }>('/api-keys', data),

  toggleApiKey: (id: string) =>
    apiClient.patch<{ success: boolean; data: ApiKey }>(`/api-keys/${id}/toggle`),

  deleteApiKey: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/api-keys/${id}`),

  // Sessions
  getSessions: (params?: { page?: number; pageSize?: number; search?: string }) =>
    apiClient.get<{ success: boolean; data: Session[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }>('/sessions', { params }),

  revokeSession: (id: string) =>
    apiClient.post<{ success: boolean; message: string }>(`/sessions/${id}/revoke`),

  revokeAllSessions: () =>
    apiClient.post<{ success: boolean; message: string }>('/sessions/revoke-all'),

  // Audit Logs
  getAuditLogs: (params?: { page?: number; pageSize?: number; search?: string; module?: string; action?: string; status?: string; userId?: string }) =>
    apiClient.get<{ success: boolean; data: AuditLog[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }>('/audit-logs', { params }),
};
