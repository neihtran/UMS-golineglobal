/**
 * WMS (Work Management) service — API client cho module WMS.
 * Backend routes: /api/wms/*
 */
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

// ─── Projects ──────────────────────────────────────────────────────────────────
export interface ProjectFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  department?: string;
  startDateFrom?: string;
  startDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Project {
  _id: string;
  name: string;
  code: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  department?: string;
  departmentName?: string;
  managerId: string;
  managerName?: string;
  memberIds: string[];
  memberNames?: string[];
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  progress: number;
  budget?: number;
  actualCost?: number;
  tags: string[];
  goals?: string;
  risks?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export const projectService = {
  list: (filters: ProjectFilters = {}) =>
    apiClient.get<PaginatedResponse<Project>>('/wms/projects', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Project>>(`/wms/projects/${id}`),

  create: (data: Partial<Project>) =>
    apiClient.post<ApiResponse<Project>>('/wms/projects', data),

  update: (id: string, data: Partial<Project>) =>
    apiClient.patch<ApiResponse<Project>>(`/wms/projects/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/wms/projects/${id}`),

  start: (id: string) =>
    apiClient.post<ApiResponse<Project>>(`/wms/projects/${id}/start`),

  complete: (id: string) =>
    apiClient.post<ApiResponse<Project>>(`/wms/projects/${id}/complete`),

  cancel: (id: string, reason?: string) =>
    apiClient.post<ApiResponse<Project>>(`/wms/projects/${id}/cancel`, { reason }),
};

// ─── Tasks ──────────────────────────────────────────────────────────────────────
export interface TaskFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  priority?: string;
  projectId?: string;
  assignedTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  projectId?: string;
  projectName?: string;
  parentTaskId?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  assignedToName?: string;
  assignedBy?: string;
  assignedByName?: string;
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  progress: number;
  dependencies: string[];
  tags: string[];
  attachmentCount: number;
  commentCount: number;
  subtaskIds: string[];
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export const taskService = {
  list: (filters: TaskFilters = {}) =>
    apiClient.get<PaginatedResponse<Task>>('/wms/tasks', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Task>>(`/wms/tasks/${id}`),

  create: (data: Partial<Task>) =>
    apiClient.post<ApiResponse<Task>>('/wms/tasks', data),

  update: (id: string, data: Partial<Task>) =>
    apiClient.patch<ApiResponse<Task>>(`/wms/tasks/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/wms/tasks/${id}`),

  start: (id: string) =>
    apiClient.post<ApiResponse<Task>>(`/wms/tasks/${id}/start`),

  complete: (id: string) =>
    apiClient.post<ApiResponse<Task>>(`/wms/tasks/${id}/complete`),

  cancel: (id: string, reason?: string) =>
    apiClient.post<ApiResponse<Task>>(`/wms/tasks/${id}/cancel`, { reason }),

  assign: (id: string, assignedTo: string) =>
    apiClient.post<ApiResponse<Task>>(`/wms/tasks/${id}/assign`, { assignedTo }),

  addComment: (id: string, comment: string) =>
    apiClient.post<ApiResponse<any>>(`/wms/tasks/${id}/comments`, { comment }),

  getComments: (id: string) =>
    apiClient.get<ApiResponse<any[]>>(`/wms/tasks/${id}/comments`),
};
