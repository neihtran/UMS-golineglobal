/**
 * OCR (Document Digitization) service — API client cho module OCR.
 * Backend routes: /api/ocr/*
 */
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

// ─── OCR Jobs ───────────────────────────────────────────────────────────────────
export interface OCRJobFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  source?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface OCRJob {
  _id: string;
  source: 'upload' | 'scan' | 'url';
  fileUrl?: string;
  fileName?: string;
  language?: string;
  outputFormat?: string;
  category?: string;
  documentId?: string;
  tags?: string[];
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  resultText?: string;
  confidence?: number;
  processingTimeMs?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export const ocrJobService = {
  list: (filters: OCRJobFilters = {}) =>
    apiClient.get<PaginatedResponse<OCRJob>>('/ocr', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<OCRJob>>(`/ocr/${id}`),

  create: (data: Partial<OCRJob>) =>
    apiClient.post<ApiResponse<OCRJob>>('/ocr', data),

  update: (id: string, data: Partial<OCRJob>) =>
    apiClient.patch<ApiResponse<OCRJob>>(`/ocr/${id}`, data),

  cancel: (id: string) =>
    apiClient.post<ApiResponse<OCRJob>>(`/ocr/${id}/cancel`),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/ocr/${id}`),

  submit: (file: File, documentType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return apiClient.post<ApiResponse<OCRJob>>('/ocr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  reprocess: (id: string) =>
    apiClient.post<ApiResponse<OCRJob>>(`/ocr/${id}/reprocess`),
};
