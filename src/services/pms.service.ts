/**
 * PMS (Party Management) service — API client cho module PMS.
 * Backend routes: /api/pms/*
 * NOTE: PMS data is strictly confidential. Handle with appropriate access controls.
 */
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

// ─── Party Members ──────────────────────────────────────────────────────────────
export interface PartyMemberFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  partyStatus?: string;
  position?: string;
  branchId?: string;
  joinDateFrom?: string;
  joinDateTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface PartyMember {
  _id: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  dateOfBirth: string;
  gender: string;
  ethnicity: string;
  religion?: string;
  idCardNumber: string;
  idCardIssuedAt?: string;
  idCardIssuedBy?: string;
  nationality: string;
  permanentAddress: string;
  currentAddress?: string;
  phone?: string;
  email?: string;
  joinDate: string;
  formalJoinDate?: string;
  partyStatus: 'probationary' | 'official' | 'reserved' | 'suspended' | 'expelled';
  partyPosition?: string;
  branchId: string;
  branchName?: string;
  parentBranchId?: string;
  parentBranchName?: string;
  educationLevel?: string;
  politicalTheory?: string;
  trainingClass?: string;
  trainingResult?: string;
  duties?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  avatarUrl?: string;
  isConfidential: boolean;
  createdAt: string;
  updatedAt: string;
}

export const partyMemberService = {
  list: (filters: PartyMemberFilters = {}) =>
    apiClient.get<PaginatedResponse<PartyMember>>('/pms/party-members', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<PartyMember>>(`/pms/party-members/${id}`),

  create: (data: Partial<PartyMember>) =>
    apiClient.post<ApiResponse<PartyMember>>('/pms/party-members', data),

  update: (id: string, data: Partial<PartyMember>) =>
    apiClient.patch<ApiResponse<PartyMember>>(`/pms/party-members/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/pms/party-members/${id}`),

  transfer: (id: string, toBranchId: string, reason: string) =>
    apiClient.post<ApiResponse<PartyMember>>(`/pms/party-members/${id}/transfer`, { toBranchId, reason }),

  changeStatus: (id: string, partyStatus: string, reason?: string) =>
    apiClient.post<ApiResponse<PartyMember>>(`/pms/party-members/${id}/status`, { partyStatus, reason }),

  promote: (id: string, newPosition: string, effectiveDate: string) =>
    apiClient.post<ApiResponse<PartyMember>>(`/pms/party-members/${id}/promote`, { newPosition, effectiveDate }),

  suspend: (id: string, reason: string, durationMonths?: number) =>
    apiClient.post<ApiResponse<PartyMember>>(`/pms/party-members/${id}/suspend`, { reason, durationMonths }),

  getProfile: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/pms/party-members/${id}/profile`),
};

// ─── Activities ─────────────────────────────────────────────────────────────────
export interface ActivityFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  status?: string;
  branchId?: string;
  organizerId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Activity {
  _id: string;
  title: string;
  description?: string;
  type: 'meeting' | 'study' | 'volunteer' | 'training' | 'conference' | 'inspection' | 'other';
  format: 'online' | 'offline' | 'hybrid';
  status: 'planned' | 'registration' | 'ongoing' | 'completed' | 'cancelled';
  branchId: string;
  branchName?: string;
  organizerId: string;
  organizerName?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  meetingLink?: string;
  expectedParticipants: number;
  actualParticipants: number;
  participantIds: string[];
  participantNames?: string[];
  content?: string;
  resolution?: string;
  attachmentUrls: string[];
  budget?: number;
  actualCost?: number;
  isMandatory: boolean;
  attendanceRequired: boolean;
  certificateIssued: boolean;
  reportUrl?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const activityService = {
  list: (filters: ActivityFilters = {}) =>
    apiClient.get<PaginatedResponse<Activity>>('/pms/activities', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Activity>>(`/pms/activities/${id}`),

  create: (data: Partial<Activity>) =>
    apiClient.post<ApiResponse<Activity>>('/pms/activities', data),

  update: (id: string, data: Partial<Activity>) =>
    apiClient.patch<ApiResponse<Activity>>(`/pms/activities/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/pms/activities/${id}`),

  register: (id: string, memberId: string) =>
    apiClient.post<ApiResponse<any>>(`/pms/activities/${id}/register`, { memberId }),

  takeAttendance: (id: string, attendance: { memberId: string; present: boolean; note?: string }[]) =>
    apiClient.post<ApiResponse<Activity>>(`/pms/activities/${id}/attendance`, { attendance }),

  start: (id: string) =>
    apiClient.post<ApiResponse<Activity>>(`/pms/activities/${id}/start`),

  complete: (id: string, data?: { resolution?: string; attachmentUrls?: string[] }) =>
    apiClient.post<ApiResponse<Activity>>(`/pms/activities/${id}/complete`, data ?? {}),

  cancel: (id: string, reason: string) =>
    apiClient.post<ApiResponse<Activity>>(`/pms/activities/${id}/cancel`, { reason }),

  getParticipants: (id: string) =>
    apiClient.get<ApiResponse<any[]>>(`/pms/activities/${id}/participants`),

  getAttendance: (id: string) =>
    apiClient.get<ApiResponse<any[]>>(`/pms/activities/${id}/attendance`),
};

// ─── Trainings ──────────────────────────────────────────────────────────────────
export interface PMSTrainingFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  status?: string;
  level?: string;
  durationFrom?: number;
  durationTo?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface PMSTraining {
  _id: string;
  title: string;
  code: string;
  description?: string;
  type: 'political_theory' | 'ideology' | 'leadership' | 'specialized' | 'foreign_language' | 'computer' | 'other';
  level: 'central' | 'provincial' | 'city' | 'district' | 'unit';
  provider: string;
  location?: string;
  format: 'course' | 'seminar' | 'workshop' | 'conference' | 'self_study' | 'online';
  startDate: string;
  endDate: string;
  totalHours: number;
  participants: {
    memberId: string;
    memberName?: string;
    status: 'registered' | 'attended' | 'completed' | 'dropped';
    result?: string;
    certificateUrl?: string;
  }[];
  maxParticipants: number;
  instructorName?: string;
  syllabus?: string;
  materials: string[];
  examType?: 'written' | 'practical' | 'oral' | 'none';
  passingScore?: number;
  resultSummary?: {
    total: number;
    passed: number;
    failed: number;
    absent: number;
  };
  cost?: number;
  isMandatory: boolean;
  validForMonths?: number;
  status: 'planned' | 'registration' | 'ongoing' | 'completed' | 'cancelled';
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const pmsTrainingService = {
  list: (filters: PMSTrainingFilters = {}) =>
    apiClient.get<PaginatedResponse<PMSTraining>>('/pms/trainings', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<PMSTraining>>(`/pms/trainings/${id}`),

  create: (data: Partial<PMSTraining>) =>
    apiClient.post<ApiResponse<PMSTraining>>('/pms/trainings', data),

  update: (id: string, data: Partial<PMSTraining>) =>
    apiClient.patch<ApiResponse<PMSTraining>>(`/pms/trainings/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/pms/trainings/${id}`),

  openRegistration: (id: string) =>
    apiClient.post<ApiResponse<PMSTraining>>(`/pms/trainings/${id}/open`),

  closeRegistration: (id: string) =>
    apiClient.post<ApiResponse<PMSTraining>>(`/pms/trainings/${id}/close`),

  start: (id: string) =>
    apiClient.post<ApiResponse<PMSTraining>>(`/pms/trainings/${id}/start`),

  complete: (id: string, resultSummary?: PMSTraining['resultSummary']) =>
    apiClient.post<ApiResponse<PMSTraining>>(`/pms/trainings/${id}/complete`, { resultSummary }),

  cancel: (id: string, reason: string) =>
    apiClient.post<ApiResponse<PMSTraining>>(`/pms/trainings/${id}/cancel`, { reason }),

  register: (id: string, memberId: string) =>
    apiClient.post<ApiResponse<any>>(`/pms/trainings/${id}/register`, { memberId }),

  recordResult: (id: string, memberId: string, result: string, certificateUrl?: string) =>
    apiClient.post<ApiResponse<any>>(`/pms/trainings/${id}/result`, { memberId, result, certificateUrl }),
};
