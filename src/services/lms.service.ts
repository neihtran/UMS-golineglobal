/**
 * LMS (Learning Management) service — API client cho module LMS.
 * Backend routes: /api/lms/*
 */
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

// ─── Courses ─────────────────────────────────────────────────────────────────────
export interface CourseFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  department?: string;
  instructorId?: string;
  semester?: string;
  educationLevel?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Course {
  _id: string;
  code: string;
  name: string;
  description?: string;
  department: string;
  departmentName?: string;
  instructorId: string;
  instructorName?: string;
  credits: number;
  theoryHours: number;
  practiceHours: number;
  semester: string;
  academicYear: string;
  maxStudents: number;
  enrolledCount: number;
  status: 'draft' | 'open' | 'ongoing' | 'closed';
  thumbnail?: string;
  syllabus?: string;
  objectives: string[];
  materials: { title: string; url: string; type: string }[];
  createdAt: string;
  updatedAt: string;
}

export const courseService = {
  list: (filters: CourseFilters = {}) =>
    apiClient.get<PaginatedResponse<Course>>('/lms/courses', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Course>>(`/lms/courses/${id}`),

  create: (data: Partial<Course>) =>
    apiClient.post<ApiResponse<Course>>('/lms/courses', data),

  update: (id: string, data: Partial<Course>) =>
    apiClient.patch<ApiResponse<Course>>(`/lms/courses/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/lms/courses/${id}`),

  open: (id: string) =>
    apiClient.post<ApiResponse<Course>>(`/lms/courses/${id}/open`),

  close: (id: string) =>
    apiClient.post<ApiResponse<Course>>(`/lms/courses/${id}/close`),

  enroll: (id: string, studentId: string) =>
    apiClient.post<ApiResponse<any>>(`/lms/courses/${id}/enroll`, { studentId }),

  unenroll: (id: string, studentId: string) =>
    apiClient.post<ApiResponse<any>>(`/lms/courses/${id}/unenroll`, { studentId }),
};

// ─── Assignments ──────────────────────────────────────────────────────────────────
export interface AssignmentFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  courseId?: string;
  status?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Assignment {
  _id: string;
  title: string;
  description?: string;
  courseId: string;
  courseName?: string;
  type: 'individual' | 'group';
  maxScore: number;
  weight: number;
  openDate: string;
  closeDate: string;
  allowLateSubmission: boolean;
  latePenaltyPercent?: number;
  attachmentTemplates: { name: string; url: string }[];
  instructions?: string;
  status: 'draft' | 'open' | 'closed' | 'graded';
  submittedCount: number;
  gradedCount: number;
  createdAt: string;
  updatedAt: string;
}

export const assignmentService = {
  list: (filters: AssignmentFilters = {}) =>
    apiClient.get<PaginatedResponse<Assignment>>('/lms/assignments', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Assignment>>(`/lms/assignments/${id}`),

  create: (data: Partial<Assignment>) =>
    apiClient.post<ApiResponse<Assignment>>('/lms/assignments', data),

  update: (id: string, data: Partial<Assignment>) =>
    apiClient.patch<ApiResponse<Assignment>>(`/lms/assignments/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/lms/assignments/${id}`),

  submit: (id: string, data: { content?: string; attachments?: File[] }) => {
    const formData = new FormData();
    if (data.content) formData.append('content', data.content);
    if (data.attachments) {
      data.attachments.forEach((file) => formData.append('attachments', file));
    }
    return apiClient.post<ApiResponse<any>>(`/lms/assignments/${id}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  grade: (id: string, studentId: string, score: number, feedback?: string) =>
    apiClient.post<ApiResponse<any>>(`/lms/assignments/${id}/grade`, { studentId, score, feedback }),

  getSubmissions: (id: string) =>
    apiClient.get<ApiResponse<any[]>>(`/lms/assignments/${id}/submissions`),
};

// ─── Attendance ──────────────────────────────────────────────────────────────────
export interface AttendanceFilters {
  page?: number;
  pageSize?: number;
  courseId?: string;
  studentId?: string;
  semester?: string;
  academicYear?: string;
  sessionDate?: string;
  status?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Attendance {
  _id: string;
  courseId: string;
  courseName?: string;
  sessionId: string;
  sessionTopic?: string;
  sessionDate: string;
  studentId: string;
  studentName?: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  note?: string;
  recordedBy: string;
  recordedByName?: string;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const attendanceService = {
  list: (filters: AttendanceFilters = {}) =>
    apiClient.get<PaginatedResponse<Attendance>>('/lms/attendance', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Attendance>>(`/lms/attendance/${id}`),

  record: (data: Partial<Attendance>) =>
    apiClient.post<ApiResponse<Attendance>>('/lms/attendance', data),

  bulkRecord: (records: Partial<Attendance>[]) =>
    apiClient.post<ApiResponse<any>>('/lms/attendance/bulk', { records }),

  update: (id: string, data: Partial<Attendance>) =>
    apiClient.patch<ApiResponse<Attendance>>(`/lms/attendance/${id}`, data),

  getBySession: (courseId: string, sessionId: string) =>
    apiClient.get<ApiResponse<Attendance[]>>(`/lms/attendance/course/${courseId}/session/${sessionId}`),

  getStudentReport: (studentId: string, courseId?: string) =>
    apiClient.get<ApiResponse<any>>(`/lms/attendance/student/${studentId}`, {
      params: { courseId },
    }),
};
