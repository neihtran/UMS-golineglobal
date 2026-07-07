/**
 * DCE (Digital Competency & Education) service — API client cho module DCE.
 * Backend routes: /api/dce/*
 */
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

// ─── Competencies ───────────────────────────────────────────────────────────────
export interface CompetencyFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  level?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface CompetencyLevel {
  level: number;
  name: string;
  description: string;
  criteria: string[];
  minScore: number;
  maxScore: number;
}

export interface Competency {
  _id: string;
  code: string;
  name: string;
  nameEn?: string;
  description?: string;
  type: 'technical' | 'soft' | 'leadership' | 'digital' | 'language' | 'professional';
  category: string;
  levels: CompetencyLevel[];
  totalLevels: number;
  weight: number;
  isActive: boolean;
  isRequired: boolean;
  assessmentMethod?: string;
  validForMonths?: number;
  prerequisiteIds: string[];
  createdAt: string;
  updatedAt: string;
}

export const competencyService = {
  list: (filters: CompetencyFilters = {}) =>
    apiClient.get<PaginatedResponse<Competency>>('/dce/competencies', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Competency>>(`/dce/competencies/${id}`),

  create: (data: Partial<Competency>) =>
    apiClient.post<ApiResponse<Competency>>('/dce/competencies', data),

  update: (id: string, data: Partial<Competency>) =>
    apiClient.patch<ApiResponse<Competency>>(`/dce/competencies/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/dce/competencies/${id}`),

  activate: (id: string) =>
    apiClient.post<ApiResponse<Competency>>(`/dce/competencies/${id}/activate`),

  deactivate: (id: string) =>
    apiClient.post<ApiResponse<Competency>>(`/dce/competencies/${id}/deactivate`),
};

// ─── Competency Assessments ─────────────────────────────────────────────────────
export interface CompetencyAssessmentFilters {
  page?: number;
  pageSize?: number;
  studentId?: string;
  competencyId?: string;
  programId?: string;
  status?: string;
  assessorId?: string;
  assessmentDateFrom?: string;
  assessmentDateTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface CompetencyAssessment {
  _id: string;
  studentId: string;
  studentName?: string;
  studentCode?: string;
  programId?: string;
  programName?: string;
  competencyId: string;
  competencyName?: string;
  competencyCode?: string;
  assessorId: string;
  assessorName?: string;
  assessmentDate: string;
  levelAchieved: number;
  score: number;
  maxScore: number;
  result: 'excellent' | 'proficient' | 'competent' | 'developing' | 'beginner';
  evidenceIds: string[];
  evidenceUrls: string[];
  feedback?: string;
  strengths: string[];
  developmentAreas: string[];
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'certified';
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  certificationDate?: string;
  certificateNumber?: string;
  expiryDate?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const competencyAssessmentService = {
  list: (filters: CompetencyAssessmentFilters = {}) =>
    apiClient.get<PaginatedResponse<CompetencyAssessment>>('/dce/competency-assessments', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<CompetencyAssessment>>(`/dce/competency-assessments/${id}`),

  create: (data: Partial<CompetencyAssessment>) =>
    apiClient.post<ApiResponse<CompetencyAssessment>>('/dce/competency-assessments', data),

  update: (id: string, data: Partial<CompetencyAssessment>) =>
    apiClient.patch<ApiResponse<CompetencyAssessment>>(`/dce/competency-assessments/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/dce/competency-assessments/${id}`),

  submit: (id: string) =>
    apiClient.post<ApiResponse<CompetencyAssessment>>(`/dce/competency-assessments/${id}/submit`),

  review: (id: string, data: { approved: boolean; comment?: string }) =>
    apiClient.post<ApiResponse<CompetencyAssessment>>(`/dce/competency-assessments/${id}/review`, data),

  certify: (id: string) =>
    apiClient.post<ApiResponse<CompetencyAssessment>>(`/dce/competency-assessments/${id}/certify`),

  getStudentPortfolio: (studentId: string) =>
    apiClient.get<ApiResponse<any>>(`/dce/competency-assessments/student/${studentId}/portfolio`),

  getProgressReport: (studentId: string, programId?: string) =>
    apiClient.get<ApiResponse<any>>(`/dce/competency-assessments/student/${studentId}/progress`, {
      params: { programId },
    }),
};

// ─── Training Programs ──────────────────────────────────────────────────────────
export interface TrainingProgramFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  status?: string;
  department?: string;
  targetAudience?: string;
  durationFrom?: number;
  durationTo?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface TrainingProgram {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: 'technical' | 'soft_skills' | 'language' | 'management' | 'compliance' | 'orientation' | 'other';
  department: string;
  departmentName?: string;
  targetAudience: 'student' | 'staff' | 'faculty' | 'admin' | 'all';
  objectives: string[];
  content: { topic: string; hours: number; method: string }[];
  totalHours: number;
  deliveryMethod: 'in_person' | 'online' | 'hybrid';
  prerequisites: string[];
  maxParticipants?: number;
  enrolledCount: number;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  location?: string;
  instructorId?: string;
  instructorName?: string;
  fee: number;
  status: 'draft' | 'open' | 'ongoing' | 'completed' | 'cancelled';
  certificateTemplate?: string;
  competencyIds: string[];
  competencyNames?: string[];
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export const trainingProgramService = {
  list: (filters: TrainingProgramFilters = {}) =>
    apiClient.get<PaginatedResponse<TrainingProgram>>('/dce/training-programs', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<TrainingProgram>>(`/dce/training-programs/${id}`),

  create: (data: Partial<TrainingProgram>) =>
    apiClient.post<ApiResponse<TrainingProgram>>('/dce/training-programs', data),

  update: (id: string, data: Partial<TrainingProgram>) =>
    apiClient.patch<ApiResponse<TrainingProgram>>(`/dce/training-programs/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/dce/training-programs/${id}`),

  openRegistration: (id: string) =>
    apiClient.post<ApiResponse<TrainingProgram>>(`/dce/training-programs/${id}/open`),

  closeRegistration: (id: string) =>
    apiClient.post<ApiResponse<TrainingProgram>>(`/dce/training-programs/${id}/close`),

  start: (id: string) =>
    apiClient.post<ApiResponse<TrainingProgram>>(`/dce/training-programs/${id}/start`),

  complete: (id: string) =>
    apiClient.post<ApiResponse<TrainingProgram>>(`/dce/training-programs/${id}/complete`),

  cancel: (id: string, reason: string) =>
    apiClient.post<ApiResponse<TrainingProgram>>(`/dce/training-programs/${id}/cancel`, { reason }),

  enroll: (id: string, participantId: string) =>
    apiClient.post<ApiResponse<any>>(`/dce/training-programs/${id}/enroll`, { participantId }),

  unenroll: (id: string, participantId: string) =>
    apiClient.post<ApiResponse<any>>(`/dce/training-programs/${id}/unenroll`, { participantId }),

  getParticipants: (id: string) =>
    apiClient.get<ApiResponse<any[]>>(`/dce/training-programs/${id}/participants`),
};
