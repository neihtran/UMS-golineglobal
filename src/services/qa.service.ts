/**
 * QA (Quality Assurance) service — API client cho module QA.
 * Backend routes: /api/qa/*
 */
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

// ─── Standards ──────────────────────────────────────────────────────────────────
export interface StandardFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  isActive?: boolean;
  department?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Standard {
  _id: string;
  code: string;
  title: string;
  description?: string;
  type: ' accreditation' | 'internal' | 'regulation' | 'iso' | 'other';
  version: string;
  effectiveDate: string;
  expiryDate?: string;
  department: string;
  departmentName?: string;
  criteria: {
    code: string;
    description: string;
    minScore: number;
    weight: number;
  }[];
  totalCriteria: number;
  isActive: boolean;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const standardService = {
  list: (filters: StandardFilters = {}) =>
    apiClient.get<PaginatedResponse<Standard>>('/qa/standards', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Standard>>(`/qa/standards/${id}`),

  create: (data: Partial<Standard>) =>
    apiClient.post<ApiResponse<Standard>>('/qa/standards', data),

  update: (id: string, data: Partial<Standard>) =>
    apiClient.patch<ApiResponse<Standard>>(`/qa/standards/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/qa/standards/${id}`),

  activate: (id: string) =>
    apiClient.post<ApiResponse<Standard>>(`/qa/standards/${id}/activate`),

  deactivate: (id: string) =>
    apiClient.post<ApiResponse<Standard>>(`/qa/standards/${id}/deactivate`),
};

// ─── Evidences ──────────────────────────────────────────────────────────────────
export interface EvidenceFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  standardId?: string;
  criterionCode?: string;
  assessmentId?: string;
  status?: string;
  type?: string;
  uploadedBy?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Evidence {
  _id: string;
  title: string;
  description?: string;
  standardId: string;
  standardTitle?: string;
  criterionCode: string;
  criterionDescription?: string;
  assessmentId?: string;
  type: 'document' | 'image' | 'video' | 'link' | 'screenshot' | 'report';
  url?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'superseded';
  uploadedBy: string;
  uploadedByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  tags: string[];
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const evidenceService = {
  list: (filters: EvidenceFilters = {}) =>
    apiClient.get<PaginatedResponse<Evidence>>('/qa/evidences', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Evidence>>(`/qa/evidences/${id}`),

  create: (data: Partial<Evidence>) =>
    apiClient.post<ApiResponse<Evidence>>('/qa/evidences', data),

  update: (id: string, data: Partial<Evidence>) =>
    apiClient.patch<ApiResponse<Evidence>>(`/qa/evidences/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/qa/evidences/${id}`),

  upload: (formData: FormData) =>
    apiClient.post<ApiResponse<Evidence>>('/qa/evidences/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  approve: (id: string, comment?: string) =>
    apiClient.post<ApiResponse<Evidence>>(`/qa/evidences/${id}/approve`, { comment }),

  reject: (id: string, reason: string) =>
    apiClient.post<ApiResponse<Evidence>>(`/qa/evidences/${id}/reject`, { reason }),

  submit: (id: string) =>
    apiClient.post<ApiResponse<Evidence>>(`/qa/evidences/${id}/submit`),
};

// ─── Assessments ────────────────────────────────────────────────────────────────
export interface AssessmentFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  standardId?: string;
  status?: string;
  department?: string;
  assessorId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface AssessmentResult {
  criterionCode: string;
  criterionDescription?: string;
  score: number;
  maxScore: number;
  percentage: number;
  result: 'met' | 'partially_met' | 'not_met' | 'not_applicable';
  evidenceIds: string[];
  note?: string;
}

export interface Assessment {
  _id: string;
  title: string;
  standardId: string;
  standardTitle?: string;
  standardVersion?: string;
  department: string;
  departmentName?: string;
  assessorId: string;
  assessorName?: string;
  status: 'draft' | 'in_progress' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  assessmentDate: string;
  results: AssessmentResult[];
  overallScore: number;
  maxOverallScore: number;
  overallPercentage: number;
  overallResult: 'excellent' | 'good' | 'satisfactory' | 'unsatisfactory' | 'fail';
  recommendation?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  approvalDate?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const assessmentService = {
  list: (filters: AssessmentFilters = {}) =>
    apiClient.get<PaginatedResponse<Assessment>>('/qa/assessments', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Assessment>>(`/qa/assessments/${id}`),

  create: (data: Partial<Assessment>) =>
    apiClient.post<ApiResponse<Assessment>>('/qa/assessments', data),

  update: (id: string, data: Partial<Assessment>) =>
    apiClient.patch<ApiResponse<Assessment>>(`/qa/assessments/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/qa/assessments/${id}`),

  submit: (id: string) =>
    apiClient.post<ApiResponse<Assessment>>(`/qa/assessments/${id}/submit`),

  review: (id: string, data: { result: 'approved' | 'rejected'; comment?: string }) =>
    apiClient.post<ApiResponse<Assessment>>(`/qa/assessments/${id}/review`, data),

  approve: (id: string) =>
    apiClient.post<ApiResponse<Assessment>>(`/qa/assessments/${id}/approve`),

  getSummary: (standardId: string) =>
    apiClient.get<ApiResponse<any>>(`/qa/assessments/summary`, { params: { standardId } }),
};

// ─── Complaints ─────────────────────────────────────────────────────────────────
export interface ComplaintFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  type?: string;
  priority?: string;
  department?: string;
  complainantId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  type: 'academic' | 'administrative' | 'harassment' | 'discrimination' | 'facility' | 'service' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'received' | 'investigating' | 'pending_response' | 'resolved' | 'escalated' | 'closed';
  complainantId: string;
  complainantName?: string;
  respondentId?: string;
  respondentName?: string;
  department: string;
  departmentName?: string;
  assignedTo?: string;
  assignedToName?: string;
  evidenceUrls: string[];
  response?: string;
  resolution?: string;
  resolutionDate?: string;
  satisfactionRating?: number;
  anonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export const complaintService = {
  list: (filters: ComplaintFilters = {}) =>
    apiClient.get<PaginatedResponse<Complaint>>('/qa/complaints', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Complaint>>(`/qa/complaints/${id}`),

  create: (data: Partial<Complaint>) =>
    apiClient.post<ApiResponse<Complaint>>('/qa/complaints', data),

  update: (id: string, data: Partial<Complaint>) =>
    apiClient.patch<ApiResponse<Complaint>>(`/qa/complaints/${id}`, data),

  assign: (id: string, assignedTo: string) =>
    apiClient.post<ApiResponse<Complaint>>(`/qa/complaints/${id}/assign`, { assignedTo }),

  investigate: (id: string) =>
    apiClient.post<ApiResponse<Complaint>>(`/qa/complaints/${id}/investigate`),

  respond: (id: string, response: string) =>
    apiClient.post<ApiResponse<Complaint>>(`/qa/complaints/${id}/respond`, { response }),

  resolve: (id: string, resolution: string) =>
    apiClient.post<ApiResponse<Complaint>>(`/qa/complaints/${id}/resolve`, { resolution }),

  close: (id: string) =>
    apiClient.post<ApiResponse<Complaint>>(`/qa/complaints/${id}/close`),

  escalate: (id: string, reason: string) =>
    apiClient.post<ApiResponse<Complaint>>(`/qa/complaints/${id}/escalate`, { reason }),

  rateSatisfaction: (id: string, rating: number) =>
    apiClient.post<ApiResponse<Complaint>>(`/qa/complaints/${id}/rate`, { rating }),
};

// ─── Assets / Tài sản ────────────────────────────────────────────────────────────
export interface QaAssetFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export type AssetStatus = 'active' | 'maintenance' | 'broken' | 'disposed';

export interface QaAsset {
  _id: string;
  code: string;
  name: string;
  category: string;
  department?: string;
  departmentName?: string;
  quantity: number;
  unit: string;
  value: number;
  originalValue?: number;
  depreciation?: number;
  depreciationRate?: number;
  status: AssetStatus;
  location: string;
  supplier: string;
  purchaseDate: string;
  warranty: string;
  assignee?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QaAssetMaintenanceLog {
  _id: string;
  assetId: string;
  type: 'maintenance' | 'repair' | 'inspection' | 'software_update';
  date: string;
  cost: number;
  note: string;
  vendor: string;
  result: string;
  performedBy?: string;
  createdAt: string;
}

export interface DepreciationRow {
  year: number;
  bookValue: number;
  depreciation: number;
}

export interface QaAssetDepreciation {
  asset: { name: string; value: number; purchaseDate: string };
  years: DepreciationRow[];
}

export const assetService = {
  list: (filters: QaAssetFilters = {}) =>
    apiClient.get<PaginatedResponse<QaAsset>>('/qa/assets', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<QaAsset>>(`/qa/assets/${id}`),

  create: (data: Partial<QaAsset>) =>
    apiClient.post<ApiResponse<QaAsset>>('/qa/assets', data),

  update: (id: string, data: Partial<QaAsset>) =>
    apiClient.patch<ApiResponse<QaAsset>>(`/qa/assets/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/qa/assets/${id}`),

  getDepreciation: (id: string) =>
    apiClient.get<ApiResponse<QaAssetDepreciation>>(`/qa/assets/${id}/depreciation`),

  getMaintenance: (id: string) =>
    apiClient.get<ApiResponse<QaAssetMaintenanceLog[]>>(`/qa/assets/${id}/maintenance`),

  createMaintenance: (id: string, data: Partial<QaAssetMaintenanceLog>) =>
    apiClient.post<ApiResponse<QaAssetMaintenanceLog>>(`/qa/assets/${id}/maintenance`, data),
};

// ─── Facilities / CSVC ──────────────────────────────────────────────────────────
export interface QaFacilityFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  status?: string;
  condition?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export type FacilityStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';
export type FacilityCondition = 'good' | 'fair' | 'needs_repair';

export interface QaFacility {
  _id: string;
  code: string;
  name: string;
  type: string;
  capacity: number;
  currentUsage: number;
  floor: string;
  building: string;
  area: number;
  equipment: number;
  status: FacilityStatus;
  condition: FacilityCondition;
  lastInspected: string;
  nextInspection: string;
  supervisor: string;
  supervisorPhone: string;
  features: string[];
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const facilityService = {
  list: (filters: QaFacilityFilters = {}) =>
    apiClient.get<PaginatedResponse<QaFacility>>('/qa/facilities', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<QaFacility>>(`/qa/facilities/${id}`),

  create: (data: Partial<QaFacility>) =>
    apiClient.post<ApiResponse<QaFacility>>('/qa/facilities', data),

  update: (id: string, data: Partial<QaFacility>) =>
    apiClient.patch<ApiResponse<QaFacility>>(`/qa/facilities/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/qa/facilities/${id}`),
};
