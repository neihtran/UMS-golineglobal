/**
 * DMS (Document Management) service — API client cho module DMS.
 * Backend routes: /api/dms/*
 */
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

// ─── Documents ──────────────────────────────────────────────────────────────────
export interface DocumentFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  categoryId?: string;
  docNumber?: string;
  urgency?: string;
  issuedBy?: string;
  issuedFrom?: string;
  issuedTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  docType?: string;
}

export interface Document {
  _id: string;
  title: string;
  docNumber: string;
  categoryId: string;
  categoryName?: string;
  type: string;
  urgency: 'normal' | 'urgent' | 'very_urgent';
  status: 'draft' | 'pending' | 'in_progress' | 'approved' | 'rejected' | 'signed' | 'published' | 'archived';
  issuedDate: string;
  effectiveDate?: string;
  expiryDate?: string;
  issuedBy: string;
  issuedByName?: string;
  signer?: string;
  signerTitle?: string;
  recipientUnits: string[];
  recipientNames?: string[];
  attachments: { name: string; url: string; size: number }[];
  tags: string[];
  summary?: string;
  metadata?: Record<string, unknown>;
  relatedDocIds: string[];
  createdBy: string;
  createdByName?: string;
  currentStep?: number;
  totalSteps?: number;
  createdAt: string;
  updatedAt: string;
}

export const documentService = {
  list: (filters: DocumentFilters = {}) =>
    apiClient.get<PaginatedResponse<Document>>('/dms/documents', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Document>>(`/dms/documents/${id}`),

  create: (data: Partial<Document>) =>
    apiClient.post<ApiResponse<Document>>('/dms/documents', data),

  update: (id: string, data: Partial<Document>) =>
    apiClient.patch<ApiResponse<Document>>(`/dms/documents/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/dms/documents/${id}`),

  submit: (id: string) =>
    apiClient.post<ApiResponse<Document>>(`/dms/documents/${id}/submit`),

  approve: (id: string, comment?: string) =>
    apiClient.post<ApiResponse<Document>>(`/dms/documents/${id}/approve`, { comment }),

  reject: (id: string, comment: string) =>
    apiClient.post<ApiResponse<Document>>(`/dms/documents/${id}/reject`, { comment }),

  sign: (id: string) =>
    apiClient.post<ApiResponse<Document>>(`/dms/documents/${id}/sign`),

  publish: (id: string) =>
    apiClient.post<ApiResponse<Document>>(`/dms/documents/${id}/publish`),

  archive: (id: string) =>
    apiClient.post<ApiResponse<Document>>(`/dms/documents/${id}/archive`),
};

// ─── Categories ──────────────────────────────────────────────────────────────────
export interface CategoryFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  parentId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Category {
  _id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  parentName?: string;
  workflowId?: string;
  workflowName?: string;
  docTypes: string[];
  retentionMonths?: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const categoryService = {
  list: (filters: CategoryFilters = {}) =>
    apiClient.get<PaginatedResponse<Category>>('/dms/categories', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Category>>(`/dms/categories/${id}`),

  create: (data: Partial<Category>) =>
    apiClient.post<ApiResponse<Category>>('/dms/categories', data),

  update: (id: string, data: Partial<Category>) =>
    apiClient.patch<ApiResponse<Category>>(`/dms/categories/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/dms/categories/${id}`),
};

// ─── Approval Flows ──────────────────────────────────────────────────────────────
export interface ApprovalFlowFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ApprovalFlowStep {
  step: number;
  roleId: string;
  roleName: string;
  approverIds: string[];
  approverNames?: string[];
  isSequential: boolean;
  timeoutHours?: number;
  requireAllApprovers: boolean;
  allowSkip: boolean;
}

export interface ApprovalFlow {
  _id: string;
  name: string;
  code: string;
  description?: string;
  steps: ApprovalFlowStep[];
  totalSteps: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const approvalFlowService = {
  list: (filters: ApprovalFlowFilters = {}) =>
    apiClient.get<PaginatedResponse<ApprovalFlow>>('/dms/approval-flows', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<ApprovalFlow>>(`/dms/approval-flows/${id}`),

  create: (data: Partial<ApprovalFlow>) =>
    apiClient.post<ApiResponse<ApprovalFlow>>('/dms/approval-flows', data),

  update: (id: string, data: Partial<ApprovalFlow>) =>
    apiClient.patch<ApiResponse<ApprovalFlow>>(`/dms/approval-flows/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/dms/approval-flows/${id}`),
};
