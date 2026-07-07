/**
 * Leave service — wraps backend leave endpoints.
 */
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

export interface LeaveFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  employeeId?: string;
  type?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface LeaveRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  departmentName?: string;
  type: 'annual' | 'sick' | 'unpaid' | 'maternity' | 'paternity' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approver?: string;
  approverName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export const leaveService = {
  list: (filters: LeaveFilters = {}) =>
    apiClient.get<PaginatedResponse<LeaveRequest>>('/leave', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<LeaveRequest>>(`/leave/${id}`),

  create: (data: Partial<LeaveRequest>) =>
    apiClient.post<ApiResponse<LeaveRequest>>('/leave', data),

  update: (id: string, data: Partial<LeaveRequest>) =>
    apiClient.patch<ApiResponse<LeaveRequest>>(`/leave/${id}`, data),

  approve: (id: string) =>
    apiClient.post<ApiResponse<LeaveRequest>>(`/leave/${id}/approve`),

  reject: (id: string, reason?: string) =>
    apiClient.post<ApiResponse<LeaveRequest>>(`/leave/${id}/reject`, { reason }),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/leave/${id}`),

  stats: () =>
    apiClient.get<ApiResponse<LeaveStats>>('/leave/stats'),

  getLeaveBalance: (employeeId: string) =>
    apiClient.get<ApiResponse<{ employeeId: string; year: number; byType: Array<{ type: string; label: string; entitled: number; used: number; remaining: number; color: string }>; history: any[] }>>(`/leave/${employeeId}/balance`),
};
