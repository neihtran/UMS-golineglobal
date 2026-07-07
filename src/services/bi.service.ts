/**
 * BI (Business Intelligence) service — API client cho module BI.
 * Backend routes: /api/bi/*
 */
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

// ─── Reports ────────────────────────────────────────────────────────────────────
export interface ReportFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  category?: string;
  isPublic?: boolean;
  createdBy?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Report {
  _id: string;
  title: string;
  name: string;
  description?: string;
  type: 'enrollment' | 'academic' | 'financial' | 'hr' | 'attendance' | 'research' | 'custom';
  category: string;
  subcategory?: string;
  isPublic: boolean;
  visibility: 'public' | 'department' | 'restricted';
  allowedRoles: string[];
  allowedDepartments: string[];
  dataSource: string;
  query?: string;
  parameters: {
    name: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'daterange' | 'select' | 'multiselect';
    required: boolean;
    defaultValue?: unknown;
    options?: { value: string; label: string }[];
  }[];
  chartType?: 'table' | 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'mixed';
  columns: { key: string; label: string; format?: string; align?: 'left' | 'center' | 'right' }[];
  lastRunAt?: string;
  lastRunStatus?: 'success' | 'failed' | 'partial';
  lastRunDuration?: number;
  lastRunError?: string;
  runCount: number;
  favoriteCount: number;
  createdBy: string;
  createdByName?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const reportService = {
  list: (filters: ReportFilters = {}) =>
    apiClient.get<PaginatedResponse<Report>>('/bi/reports', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Report>>(`/bi/reports/${id}`),

  create: (data: Partial<Report>) =>
    apiClient.post<ApiResponse<Report>>('/bi/reports', data),

  update: (id: string, data: Partial<Report>) =>
    apiClient.patch<ApiResponse<Report>>(`/bi/reports/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/bi/reports/${id}`),

  run: (id: string, params?: Record<string, unknown>) =>
    apiClient.post<ApiResponse<any>>(`/bi/reports/${id}/run`, { params }),

  getLastRun: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/bi/reports/${id}/last-run`),

  favorite: (id: string) =>
    apiClient.post<ApiResponse<any>>(`/bi/reports/${id}/favorite`),

  unfavorite: (id: string) =>
    apiClient.delete<ApiResponse<any>>(`/bi/reports/${id}/favorite`),

  export: (id: string, format: 'pdf' | 'excel' | 'csv', params?: Record<string, unknown>) =>
    apiClient.get<ApiResponse<string>>(`/bi/reports/${id}/export`, { params: { format, ...params } }),

  duplicate: (id: string) =>
    apiClient.post<ApiResponse<Report>>(`/bi/reports/${id}/duplicate`),
};

// ─── Report Schedules ───────────────────────────────────────────────────────────
export interface ReportScheduleFilters {
  page?: number;
  pageSize?: number;
  reportId?: string;
  status?: string;
  frequency?: string;
  createdBy?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ReportSchedule {
  _id: string;
  reportId: string;
  reportTitle?: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  cronExpression?: string;
  params?: Record<string, unknown>;
  recipients: {
    type: 'user' | 'role' | 'department' | 'email';
    id?: string;
    email: string;
    name?: string;
  }[];
  exportFormat: 'pdf' | 'excel' | 'csv';
  status: 'active' | 'paused' | 'error';
  nextRunAt?: string;
  lastRunAt?: string;
  lastRunStatus?: 'success' | 'failed';
  lastRunError?: string;
  runCount: number;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export const reportScheduleService = {
  list: (filters: ReportScheduleFilters = {}) =>
    apiClient.get<PaginatedResponse<ReportSchedule>>('/bi/report-schedules', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<ReportSchedule>>(`/bi/report-schedules/${id}`),

  create: (data: Partial<ReportSchedule>) =>
    apiClient.post<ApiResponse<ReportSchedule>>('/bi/report-schedules', data),

  update: (id: string, data: Partial<ReportSchedule>) =>
    apiClient.patch<ApiResponse<ReportSchedule>>(`/bi/report-schedules/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/bi/report-schedules/${id}`),

  pause: (id: string) =>
    apiClient.post<ApiResponse<ReportSchedule>>(`/bi/report-schedules/${id}/pause`),

  resume: (id: string) =>
    apiClient.post<ApiResponse<ReportSchedule>>(`/bi/report-schedules/${id}/resume`),

  runNow: (id: string) =>
    apiClient.post<ApiResponse<any>>(`/bi/report-schedules/${id}/run`),

  getHistory: (id: string) =>
    apiClient.get<ApiResponse<any[]>>(`/bi/report-schedules/${id}/history`),
};
