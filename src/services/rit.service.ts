/**
 * RIT (Research & International Cooperation) service — API client cho module RIT.
 * Backend routes: /api/rit/*
 */
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

// ─── Research Projects ──────────────────────────────────────────────────────────
export interface ResearchProjectFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  projectType?: string;
  department?: string;
  leaderId?: string;
  fundingSource?: string;
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ResearchProject {
  _id: string;
  title: string;
  code: string;
  description?: string;
  projectType: 'fundamental' | 'applied' | 'development' | 'policy';
  field: string;
  status: 'proposal' | 'approved' | 'ongoing' | 'suspended' | 'completed' | 'cancelled';
  leaderId: string;
  leaderName?: string;
  memberIds: string[];
  memberNames?: string[];
  department: string;
  departmentName?: string;
  fundingSource: string;
  approvedBudget: number;
  actualBudget?: number;
  startDate?: string;
  endDate?: string;
  durationMonths?: number;
  progress: number;
  objectives: string[];
  deliverables: string[];
  publications: string[];
  milestones: { title: string; dueDate: string; status: string }[];
  reportCount: number;
  createdAt: string;
  updatedAt: string;
}

export const researchProjectService = {
  list: (filters: ResearchProjectFilters = {}) =>
    apiClient.get<PaginatedResponse<ResearchProject>>('/rit/research-projects', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<ResearchProject>>(`/rit/research-projects/${id}`),

  create: (data: Partial<ResearchProject>) =>
    apiClient.post<ApiResponse<ResearchProject>>('/rit/research-projects', data),

  update: (id: string, data: Partial<ResearchProject>) =>
    apiClient.patch<ApiResponse<ResearchProject>>(`/rit/research-projects/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/rit/research-projects/${id}`),

  approve: (id: string) =>
    apiClient.post<ApiResponse<ResearchProject>>(`/rit/research-projects/${id}/approve`),

  suspend: (id: string, reason: string) =>
    apiClient.post<ApiResponse<ResearchProject>>(`/rit/research-projects/${id}/suspend`, { reason }),

  complete: (id: string) =>
    apiClient.post<ApiResponse<ResearchProject>>(`/rit/research-projects/${id}/complete`),

  submitReport: (id: string, reportData: Partial<any>) =>
    apiClient.post<ApiResponse<any>>(`/rit/research-projects/${id}/reports`, reportData),
};

// ─── Publications ───────────────────────────────────────────────────────────────
export interface PublicationFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  status?: string;
  authorId?: string;
  department?: string;
  yearFrom?: number;
  yearTo?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Publication {
  _id: string;
  title: string;
  type: 'journal' | 'conference' | 'book' | 'book_chapter' | 'report' | 'thesis' | 'other';
  status: 'draft' | 'submitted' | 'accepted' | 'published' | 'rejected';
  authors: {
    userId: string;
    name: string;
    order: number;
    affiliation?: string;
    isCorresponding: boolean;
  }[];
  coAuthors: string[];
  department: string;
  departmentName?: string;
  journalName?: string;
  conferenceName?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  isbn?: string;
  issn?: string;
  year: number;
  month?: string;
  abstract?: string;
  keywords: string[];
  language: string;
  fileUrl?: string;
  projectId?: string;
  projectName?: string;
  citationCount: number;
  impactFactor?: number;
  quartile?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const publicationService = {
  list: (filters: PublicationFilters = {}) =>
    apiClient.get<PaginatedResponse<Publication>>('/rit/publications', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Publication>>(`/rit/publications/${id}`),

  create: (data: Partial<Publication>) =>
    apiClient.post<ApiResponse<Publication>>('/rit/publications', data),

  update: (id: string, data: Partial<Publication>) =>
    apiClient.patch<ApiResponse<Publication>>(`/rit/publications/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/rit/publications/${id}`),

  submit: (id: string) =>
    apiClient.post<ApiResponse<Publication>>(`/rit/publications/${id}/submit`),

  accept: (id: string) =>
    apiClient.post<ApiResponse<Publication>>(`/rit/publications/${id}/accept`),

  reject: (id: string, reason: string) =>
    apiClient.post<ApiResponse<Publication>>(`/rit/publications/${id}/reject`, { reason }),
};

// ─── Patents ────────────────────────────────────────────────────────────────────
export interface PatentFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  type?: string;
  inventorId?: string;
  department?: string;
  filingDateFrom?: string;
  filingDateTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Patent {
  _id: string;
  title: string;
  patentNumber?: string;
  applicationNumber?: string;
  type: 'invention' | 'utility_model' | 'design' | 'software' | 'plant_variety';
  status: 'draft' | 'filed' | 'published' | 'granted' | 'rejected' | 'expired' | 'withdrawn';
  inventors: {
    userId: string;
    name: string;
    order: number;
    affiliation?: string;
  }[];
  department: string;
  departmentName?: string;
  filingDate?: string;
  publicationDate?: string;
  grantDate?: string;
  expiryDate?: string;
  jurisdiction: string;
  ipcCodes: string[];
  abstract?: string;
  claims?: string;
  projectId?: string;
  projectName?: string;
  fileUrl?: string;
  certificateUrl?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const patentService = {
  list: (filters: PatentFilters = {}) =>
    apiClient.get<PaginatedResponse<Patent>>('/rit/patents', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Patent>>(`/rit/patents/${id}`),

  create: (data: Partial<Patent>) =>
    apiClient.post<ApiResponse<Patent>>('/rit/patents', data),

  update: (id: string, data: Partial<Patent>) =>
    apiClient.patch<ApiResponse<Patent>>(`/rit/patents/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/rit/patents/${id}`),

  file: (id: string, filingData: { applicationNumber: string; filingDate: string; jurisdiction: string }) =>
    apiClient.post<ApiResponse<Patent>>(`/rit/patents/${id}/file`, filingData),

  grant: (id: string, grantData: { grantDate: string; patentNumber: string; expiryDate: string }) =>
    apiClient.post<ApiResponse<Patent>>(`/rit/patents/${id}/grant`, grantData),
};
