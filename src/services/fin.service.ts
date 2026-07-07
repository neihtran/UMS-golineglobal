/**
 * FIN (Finance & Accounting) service — API client cho module FIN.
 * Backend routes: /api/fin/*
 */
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

// ─── Tuition ─────────────────────────────────────────────────────────────────────
export interface TuitionFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  studentId?: string;
  studentName?: string;
  semester?: string;
  academicYear?: string;
  status?: string;
  fromAmount?: number;
  toAmount?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Tuition {
  _id: string;
  code?: string;
  studentId: string;
  student?: string | { name?: string; code?: string };
  studentName?: string;
  studentCode?: string;
  semester: string;
  academicYear: string;
  amount: number;
  tuitionFee?: number;
  otherFees?: number;
  total?: number;
  totalAmount?: number;
  paidAmount: number;
  amountPaid?: number;
  paid?: number;
  remaining?: number;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue' | 'refunded' | 'waived';
  paymentMethod?: string;
  method?: string;
  receiptNo?: string;
  paidAt?: string;
  dueDate?: string;
  note?: string;
  class?: string;
  className?: string;
  department?: string;
  departmentName?: string;
  cohort?: string;
  createdAt: string;
  updatedAt: string;
}

export const tuitionService = {
  list: (filters: TuitionFilters = {}) =>
    apiClient.get<PaginatedResponse<Tuition>>('/fin/tuition', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Tuition>>(`/fin/tuition/${id}`),

  create: (data: Partial<Tuition>) =>
    apiClient.post<ApiResponse<Tuition>>('/fin/tuition', data),

  update: (id: string, data: Partial<Tuition>) =>
    apiClient.patch<ApiResponse<Tuition>>(`/fin/tuition/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/fin/tuition/${id}`),

  getStudentTuition: (studentId: string, academicYear?: string) =>
    apiClient.get<PaginatedResponse<Tuition>>('/fin/tuition/student/' + studentId, {
      params: academicYear ? { academicYear } : {},
    }),

  recordPayment: (id: string, data: { amount: number; method?: string; note?: string }) =>
    apiClient.post<ApiResponse<Tuition>>(`/fin/tuition/${id}/record-payment`, data),

  waive: (id: string, data: { amount: number; reason?: string }) =>
    apiClient.post<ApiResponse<Tuition>>(`/fin/tuition/${id}/waive`, data),

  exempt: (id: string, reason?: string) =>
    apiClient.post<ApiResponse<Tuition>>(`/fin/tuition/${id}/exempt`, { reason }),
};

// ─── Expenditure ───────────────────────────────────────────────────────────────
export interface ExpenditureFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  status?: string;
  department?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Expenditure {
  _id: string;
  code?: string;
  title?: string;
  name: string;
  category: 'personnel' | 'equipment' | 'infrastructure' | 'research' | 'training' | 'student_support' | 'administrative' | 'other';
  amount: number;
  department?: string;
  departmentName?: string;
  applicant?: string;
  approver?: string;
  approverRole?: string;
  reason?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  requestDate?: string;
  approveDate?: string;
  approvedAt?: string;
  approvedByName?: string;
  notes?: string;
  note?: string;
  paidTo?: string;
  bankAccount?: string;
  paymentMethod?: string;
  urgency?: string;
  date?: string;
  description?: string;
  requester?: { name?: string } | string;
  requestedBy?: { name?: string } | string;
  requestedByName?: string;
  requesterName?: string;
  history?: Array<{ version: string; date: string; by: string }>;
  versions?: Array<{ version: string; date: string; by: string }>;
  createdAt: string;
  updatedAt: string;
}

export const expenditureService = {
  list: (filters: ExpenditureFilters = {}) =>
    apiClient.get<PaginatedResponse<Expenditure>>('/fin/expenditure', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Expenditure>>(`/fin/expenditure/${id}`),

  create: (data: Partial<Expenditure>) =>
    apiClient.post<ApiResponse<Expenditure>>('/fin/expenditure', data),

  update: (id: string, data: Partial<Expenditure>) =>
    apiClient.patch<ApiResponse<Expenditure>>(`/fin/expenditure/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/fin/expenditure/${id}`),

  approve: (id: string) =>
    apiClient.post<ApiResponse<Expenditure>>(`/fin/expenditure/${id}/approve`),

  reject: (id: string, reason?: string) =>
    apiClient.post<ApiResponse<Expenditure>>(`/fin/expenditure/${id}/reject`, { reason }),

  processPayment: (id: string, data: { method?: string; note?: string }) =>
    apiClient.post<ApiResponse<Expenditure>>(`/fin/expenditure/${id}/process-payment`, data),
};

// ─── Tuition Invoice ───────────────────────────────────────────────────────────
export interface TuitionInvoiceFilters extends TuitionFilters {
  issuedBy?: string;
}

export interface TuitionInvoice {
  _id: string;
  studentId: string;
  studentName?: string;
  invoiceNumber: string;
  items: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
  totalAmount: number;
  paidAmount: number;
  status: 'issued' | 'paid' | 'cancelled';
  issuedAt: string;
  dueDate?: string;
  paidAt?: string;
  issuedBy?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const tuitionInvoiceService = {
  list: (filters: TuitionInvoiceFilters = {}) =>
    apiClient.get<PaginatedResponse<TuitionInvoice>>('/fin/tuition-invoice', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<TuitionInvoice>>(`/fin/tuition-invoice/${id}`),

  create: (data: Partial<TuitionInvoice>) =>
    apiClient.post<ApiResponse<TuitionInvoice>>('/fin/tuition-invoice', data),

  update: (id: string, data: Partial<TuitionInvoice>) =>
    apiClient.patch<ApiResponse<TuitionInvoice>>(`/fin/tuition-invoice/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/fin/tuition-invoice/${id}`),

  cancel: (id: string, reason?: string) =>
    apiClient.post<ApiResponse<TuitionInvoice>>(`/fin/tuition-invoice/${id}/cancel`, { reason }),

  refund: (id: string, data: { amount: number; reason: string }) =>
    apiClient.post<ApiResponse<TuitionInvoice>>(`/fin/tuition-invoice/${id}/refund`, data),

  download: (id: string) =>
    apiClient.get<ApiResponse<string>>(`/fin/tuition-invoice/${id}/download`),
};

