/**
 * INT (Integration) service — API client cho module INT.
 * Backend routes: /api/int/*
 */
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

// ─── Integrations ────────────────────────────────────────────────────────────────
export interface IntegrationFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  status?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Integration {
  _id: string;
  name: string;
  code: string;
  type: 'sso' | 'payment' | 'sms' | 'email' | 'storage' | 'analytics' | 'lms' | 'erp' | 'other';
  description?: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  provider: string;
  version: string;
  endpoint?: string;
  authMethod: 'api_key' | 'oauth2' | 'jwt' | 'basic' | 'bearer';
  credentials?: Record<string, string>;
  config: Record<string, unknown>;
  syncFrequency?: string;
  lastSyncAt?: string;
  lastSyncStatus?: 'success' | 'failed' | 'partial';
  lastError?: string;
  modules: string[];
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export const integrationService = {
  list: (filters: IntegrationFilters = {}) =>
    apiClient.get<PaginatedResponse<Integration>>('/int/integrations', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Integration>>(`/int/integrations/${id}`),

  create: (data: Partial<Integration>) =>
    apiClient.post<ApiResponse<Integration>>('/int/integrations', data),

  update: (id: string, data: Partial<Integration>) =>
    apiClient.patch<ApiResponse<Integration>>(`/int/integrations/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/int/integrations/${id}`),

  activate: (id: string) =>
    apiClient.post<ApiResponse<Integration>>(`/int/integrations/${id}/activate`),

  deactivate: (id: string) =>
    apiClient.post<ApiResponse<Integration>>(`/int/integrations/${id}/deactivate`),

  test: (id: string) =>
    apiClient.post<ApiResponse<{ success: boolean; message: string }>>(`/int/integrations/${id}/test`),

  sync: (id: string) =>
    apiClient.post<ApiResponse<any>>(`/int/integrations/${id}/sync`),

  getCredentials: (id: string) =>
    apiClient.get<ApiResponse<Record<string, string>>>(`/int/integrations/${id}/credentials`),

  updateCredentials: (id: string, credentials: Record<string, string>) =>
    apiClient.patch<ApiResponse<any>>(`/int/integrations/${id}/credentials`, credentials),
};

// ─── Integration Logs ────────────────────────────────────────────────────────────
export interface IntegrationLogFilters {
  page?: number;
  pageSize?: number;
  integrationId?: string;
  type?: string;
  level?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface IntegrationLog {
  _id: string;
  integrationId: string;
  integrationName?: string;
  type: 'sync' | 'auth' | 'webhook' | 'callback' | 'error' | 'test';
  level: 'info' | 'warning' | 'error' | 'debug';
  status: 'success' | 'failed' | 'partial';
  endpoint?: string;
  method?: string;
  requestHeaders?: Record<string, string>;
  requestBody?: unknown;
  responseStatus?: number;
  responseBody?: unknown;
  errorMessage?: string;
  errorStack?: string;
  duration?: number;
  recordsProcessed?: number;
  recordsFailed?: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export const integrationLogService = {
  list: (filters: IntegrationLogFilters = {}) =>
    apiClient.get<PaginatedResponse<IntegrationLog>>('/int/integration-logs', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<IntegrationLog>>(`/int/integration-logs/${id}`),

  getByIntegration: (integrationId: string, filters?: Partial<IntegrationLogFilters>) =>
    apiClient.get<PaginatedResponse<IntegrationLog>>(`/int/integration-logs/integration/${integrationId}`, {
      params: filters,
    }),

  clear: (integrationId: string, olderThanDays?: number) =>
    apiClient.delete<ApiResponse<any>>(`/int/integration-logs/integration/${integrationId}/clear`, {
      params: { olderThanDays },
    }),

  export: (filters: IntegrationLogFilters) =>
    apiClient.get<ApiResponse<string>>('/int/integration-logs/export', { params: filters }),
};
