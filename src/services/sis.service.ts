/**
 * SIS (Sinh viên & Đào tạo) service — API client cho module SIS.
 * Backend routes: /api/sis/*
 */
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { Student } from '@/types/common.types';
export type { Student };

// ─── Students ──────────────────────────────────────────────────────────────────
export interface StudentFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  department?: string;
  className?: string;
  educationLevel?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const studentService = {
  list: (filters: StudentFilters = {}) =>
    apiClient.get<PaginatedResponse<Student>>('/sis/students', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Student>>(`/sis/students/${id}`),

  create: (data: Partial<Student>) =>
    apiClient.post<ApiResponse<Student>>('/sis/students', data),

  update: (id: string, data: Partial<Student>) =>
    apiClient.patch<ApiResponse<Student>>(`/sis/students/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/sis/students/${id}`),

  stats: () =>
    apiClient.get<ApiResponse<any>>('/sis/students/stats'),
};

// ─── Subjects ──────────────────────────────────────────────────────────────────
export interface SubjectFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  department?: string;
  credits?: number;
  isActive?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Subject {
  _id: string;
  code: string;
  name: string;
  credits: number;
  theoryHours: number;
  practiceHours: number;
  department: string;
  departmentName?: string;
  prereqIds: string[];
  semesterOffered: string[];
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const subjectService = {
  list: (filters: SubjectFilters = {}) =>
    apiClient.get<PaginatedResponse<Subject>>('/sis/subjects', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Subject>>(`/sis/subjects/${id}`),

  create: (data: Partial<Subject>) =>
    apiClient.post<ApiResponse<Subject>>('/sis/subjects', data),

  update: (id: string, data: Partial<Subject>) =>
    apiClient.patch<ApiResponse<Subject>>(`/sis/subjects/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/sis/subjects/${id}`),
};

// ─── Enrollments ───────────────────────────────────────────────────────────────
export interface EnrollmentFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  studentId?: string;
  subjectId?: string;
  semester?: string;
  academicYear?: string;
  classGroup?: string;
  status?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Enrollment {
  _id: string;
  studentId: string;
  studentName?: string;
  subjectId: string;
  subjectName?: string;
  semester: string;
  academicYear: string;
  classGroup?: string;
  status: string;
  scoreFormative?: number;
  scoreMidterm?: number;
  scoreFinal?: number;
  grade?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const enrollmentService = {
  list: (filters: EnrollmentFilters = {}) =>
    apiClient.get<PaginatedResponse<Enrollment>>('/sis/enrollments', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Enrollment>>(`/sis/enrollments/${id}`),

  create: (data: Partial<Enrollment>) =>
    apiClient.post<ApiResponse<Enrollment>>('/sis/enrollments', data),

  update: (id: string, data: Partial<Enrollment>) =>
    apiClient.patch<ApiResponse<Enrollment>>(`/sis/enrollments/${id}`, data),
};

// ─── Curriculum ────────────────────────────────────────────────────────────────
export interface CurriculumFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  educationLevel?: string;
  status?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Curriculum {
  _id: string;
  name: string;
  code: string;
  educationLevel: string;
  department?: string;
  totalCredits: number;
  durationYears: number;
  startYear: number;
  status: string;
  description?: string;
  subjects: string[];
  createdAt: string;
  updatedAt: string;
}

export const curriculumService = {
  list: (filters: CurriculumFilters = {}) =>
    apiClient.get<PaginatedResponse<Curriculum>>('/sis/curriculum', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Curriculum>>(`/sis/curriculum/${id}`),

  create: (data: Partial<Curriculum>) =>
    apiClient.post<ApiResponse<Curriculum>>('/sis/curriculum', data),

  update: (id: string, data: Partial<Curriculum>) =>
    apiClient.patch<ApiResponse<Curriculum>>(`/sis/curriculum/${id}`, data),
};

// ─── Internships ───────────────────────────────────────────────────────────────
export interface InternshipFilters {
  page?: number;
  pageSize?: number;
  studentId?: string;
  status?: string;
  companyName?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Internship {
  _id: string;
  studentId: string;
  studentName?: string;
  companyName: string;
  companyAddress?: string;
  position?: string;
  mentorName?: string;
  mentorPhone?: string;
  startDate: string;
  endDate: string;
  status: string;
  reportUrl?: string;
  grade?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const internshipService = {
  list: (filters: InternshipFilters = {}) =>
    apiClient.get<PaginatedResponse<Internship>>('/sis/internships', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Internship>>(`/sis/internships/${id}`),

  create: (data: Partial<Internship>) =>
    apiClient.post<ApiResponse<Internship>>('/sis/internships', data),

  update: (id: string, data: Partial<Internship>) =>
    apiClient.patch<ApiResponse<Internship>>(`/sis/internships/${id}`, data),
};

// ─── Graduation ────────────────────────────────────────────────────────────────
export interface GraduationFilters {
  page?: number;
  pageSize?: number;
  academicYear?: string;
  sessionStatus?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const graduationService = {
  sessions: (filters: GraduationFilters = {}) =>
    apiClient.get<PaginatedResponse<any>>('/sis/graduation/sessions', { params: filters }),

  createSession: (data: any) =>
    apiClient.post<ApiResponse<any>>('/sis/graduation/sessions', data),

  updateSession: (id: string, data: any) =>
    apiClient.patch<ApiResponse<any>>(`/sis/graduation/sessions/${id}`, data),

  closeSession: (id: string) =>
    apiClient.post<ApiResponse<any>>(`/sis/graduation/sessions/${id}/close`),

  records: (sessionId: string) =>
    apiClient.get<ApiResponse<any[]>>(`/sis/graduation/sessions/${sessionId}/records`),

  createRecord: (sessionId: string, data: any) =>
    apiClient.post<ApiResponse<any>>(`/sis/graduation/sessions/${sessionId}/records`, data),

  updateRecord: (sessionId: string, recordId: string, data: any) =>
    apiClient.patch<ApiResponse<any>>(`/sis/graduation/sessions/${sessionId}/records/${recordId}`, data),

  deleteRecord: (sessionId: string, recordId: string) =>
    apiClient.delete<ApiResponse<null>>(`/sis/graduation/sessions/${sessionId}/records/${recordId}`),
};

// ─── Announcement (Portal) ────────────────────────────────────────────────────
export const announcementService = {
  list: (params?: any) =>
    apiClient.get<PaginatedResponse<any>>('/portal/announcements', { params }),
  get: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/portal/announcements/${id}`),
  create: (data: any) =>
    apiClient.post<ApiResponse<any>>('/portal/announcements', data),
  update: (id: string, data: any) =>
    apiClient.patch<ApiResponse<any>>(`/portal/announcements/${id}`, data),
  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/portal/announcements/${id}`),
};
