/**
 * EXAM service — API client cho module EXAM.
 * Backend routes: /api/exam/*
 */
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

// ─── Exams ──────────────────────────────────────────────────────────────────────
export interface ExamFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  courseId?: string;
  examType?: string;
  semester?: string;
  academicYear?: string;
  createdBy?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Exam {
  _id: string;
  title: string;
  code: string;
  courseId: string;
  courseName?: string;
  examType: 'midterm' | 'final' | 'quiz' | 'practice' | 'other';
  totalScore: number;
  passingScore: number;
  duration: number;
  questionCount: number;
  allowedAttempts?: number;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showResults: boolean;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'archived';
  openTime?: string;
  closeTime?: string;
  rules?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export const examService = {
  list: (filters: ExamFilters = {}) =>
    apiClient.get<PaginatedResponse<Exam>>('/exam/exams', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Exam>>(`/exam/exams/${id}`),

  create: (data: Partial<Exam>) =>
    apiClient.post<ApiResponse<Exam>>('/exam/exams', data),

  update: (id: string, data: Partial<Exam>) =>
    apiClient.patch<ApiResponse<Exam>>(`/exam/exams/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/exam/exams/${id}`),

  publish: (id: string) =>
    apiClient.post<ApiResponse<Exam>>(`/exam/exams/${id}/publish`),

  archive: (id: string) =>
    apiClient.post<ApiResponse<Exam>>(`/exam/exams/${id}/archive`),
};

// ─── Questions ──────────────────────────────────────────────────────────────────
export interface QuestionFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  difficulty?: string;
  courseId?: string;
  subjectId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Question {
  _id: string;
  content: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching';
  difficulty: 'easy' | 'medium' | 'hard';
  courseId?: string;
  courseName?: string;
  subjectId?: string;
  subjectName?: string;
  options?: { key: string; text: string; isCorrect: boolean }[];
  correctAnswer?: string | string[];
  correctAnswerExplanation?: string;
  score: number;
  tags: string[];
  explanation?: string;
  isActive: boolean;
  usageCount: number;
  lastUsedAt?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export const questionService = {
  list: (filters: QuestionFilters = {}) =>
    apiClient.get<PaginatedResponse<Question>>('/exam/questions', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Question>>(`/exam/questions/${id}`),

  create: (data: Partial<Question>) =>
    apiClient.post<ApiResponse<Question>>('/exam/questions', data),

  update: (id: string, data: Partial<Question>) =>
    apiClient.patch<ApiResponse<Question>>(`/exam/questions/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/exam/questions/${id}`),

  import: (data: Partial<Question>[]) =>
    apiClient.post<ApiResponse<any>>('/exam/questions/import', { questions: data }),
};

// ─── Exam Sessions ───────────────────────────────────────────────────────────────
export interface ExamSessionFilters {
  page?: number;
  pageSize?: number;
  examId?: string;
  studentId?: string;
  status?: string;
  invigilatorId?: string;
  room?: string;
  date?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ExamSession {
  _id: string;
  examId: string;
  examTitle?: string;
  studentId: string;
  studentName?: string;
  studentCode?: string;
  status: 'registered' | 'in_progress' | 'submitted' | 'graded' | 'cancelled' | 'no_show';
  invigilatorId?: string;
  invigilatorName?: string;
  room?: string;
  seatNumber?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  ipAddress?: string;
  browserFingerprint?: string;
  cheatingFlags: string[];
  score?: number;
  autoScore?: number;
  manualScore?: number;
  createdAt: string;
  updatedAt: string;
}

export const examSessionService = {
  list: (filters: ExamSessionFilters = {}) =>
    apiClient.get<PaginatedResponse<ExamSession>>('/exam/sessions', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<ExamSession>>(`/exam/sessions/${id}`),

  start: (id: string) =>
    apiClient.post<ApiResponse<ExamSession>>(`/exam/sessions/${id}/start`),

  submit: (id: string, answers: Record<string, unknown>) =>
    apiClient.post<ApiResponse<ExamSession>>(`/exam/sessions/${id}/submit`, { answers }),

  grade: (id: string, score: number, feedback?: string) =>
    apiClient.post<ApiResponse<ExamSession>>(`/exam/sessions/${id}/grade`, { score, feedback }),

  cancel: (id: string, reason: string) =>
    apiClient.post<ApiResponse<ExamSession>>(`/exam/sessions/${id}/cancel`, { reason }),

  reportCheating: (id: string, flags: string[]) =>
    apiClient.post<ApiResponse<ExamSession>>(`/exam/sessions/${id}/report-cheating`, { flags }),

  getAnswers: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/exam/sessions/${id}/answers`),
};

// ─── Exam Results ────────────────────────────────────────────────────────────────
export interface ExamResultFilters {
  page?: number;
  pageSize?: number;
  examId?: string;
  studentId?: string;
  sessionId?: string;
  status?: string;
  scoreFrom?: number;
  scoreTo?: number;
  semester?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ExamResult {
  _id: string;
  examId: string;
  examTitle?: string;
  courseName?: string;
  sessionId: string;
  studentId: string;
  studentName?: string;
  studentCode?: string;
  totalScore: number;
  score: number;
  percentage: number;
  grade?: string;
  status: 'pending' | 'graded' | 'published';
  questionResults: {
    questionId: string;
    questionContent?: string;
    score: number;
    maxScore: number;
    isCorrect: boolean;
    studentAnswer?: string | string[];
    correctAnswer?: string | string[];
  }[];
  createdAt: string;
  updatedAt: string;
}

export const examResultService = {
  list: (filters: ExamResultFilters = {}) =>
    apiClient.get<PaginatedResponse<ExamResult>>('/exam/results', { params: filters }),

  get: (id: string) =>
    apiClient.get<ApiResponse<ExamResult>>(`/exam/results/${id}`),

  publish: (id: string) =>
    apiClient.post<ApiResponse<ExamResult>>(`/exam/results/${id}/publish`),

  exportScores: (examId: string) =>
    apiClient.get<ApiResponse<string>>(`/exam/results/export`, { params: { examId } }),

  getStatistics: (examId: string) =>
    apiClient.get<ApiResponse<any>>(`/exam/results/statistics`, { params: { examId } }),
};
