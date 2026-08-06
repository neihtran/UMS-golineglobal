// ─── LMS Part 3: Assignments Hooks ──────────────────────────────────────────────
// TanStack Query hooks for Assignment & Submission Management
//
// Part 3: Assignments, AssignmentSubmissions

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/stores/notificationStore';
import { assignmentsApi, assignmentSubmissionsApi } from '@/services/lmsApi';
import type {
  AssignmentCreatePayload,
  AssignmentListParams,
  AssignmentSubmissionCreatePayload,
  AssignmentSubmissionListParams,
  AssignmentUpdatePayload,
} from '@/types/lms.types';

// ─── Query Keys ─────────────────────────────────────────────────────────────────
export const LMS_ASSIGNMENT_QUERY_KEYS = {
  assignments: {
    all: ['lms', 'assignments'] as const,
    list: (params?: AssignmentListParams) =>
      ['lms', 'assignments', 'list', params ?? {}] as const,
    detail: (id: number) => ['lms', 'assignments', 'detail', id] as const,
  },
  submissions: {
    all: ['lms', 'submissions'] as const,
    list: (params?: AssignmentSubmissionListParams) =>
      ['lms', 'submissions', 'list', params ?? {}] as const,
    detail: (id: number) => ['lms', 'submissions', 'detail', id] as const,
    latest: (assignmentId: number, studentId?: number) =>
      ['lms', 'submissions', 'latest', assignmentId, studentId ?? 'me'] as const,
  },
};

// ─── Assignments ─────────────────────────────────────────────────────────────────
export const useAssignments = (params?: AssignmentListParams) =>
  useQuery({
    queryKey: LMS_ASSIGNMENT_QUERY_KEYS.assignments.list(params),
    queryFn: async () => (await assignmentsApi.list(params)).data,
    enabled: !!(params?.learning_course_id && params?.lesson_id),
  });

export const useAssignment = (id?: number | string) =>
  useQuery({
    queryKey: LMS_ASSIGNMENT_QUERY_KEYS.assignments.detail(Number(id)),
    queryFn: async () => (await assignmentsApi.get(id!)).data,
    enabled: !!id,
  });

export const useCreateAssignment = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (payload: AssignmentCreatePayload) => assignmentsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_ASSIGNMENT_QUERY_KEYS.assignments.all });
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Tạo bài tập thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};

export const useUpdateAssignment = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AssignmentUpdatePayload }) =>
      assignmentsApi.update(id, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: LMS_ASSIGNMENT_QUERY_KEYS.assignments.all });
      qc.invalidateQueries({ queryKey: LMS_ASSIGNMENT_QUERY_KEYS.assignments.detail(vars.id) });
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Cập nhật bài tập thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};

export const useDeleteAssignment = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (id: number | string) => assignmentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_ASSIGNMENT_QUERY_KEYS.assignments.all });
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Xóa bài tập thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};

// ─── AssignmentSubmissions ───────────────────────────────────────────────────────
export const useAssignmentSubmissions = (params?: AssignmentSubmissionListParams) =>
  useQuery({
    queryKey: LMS_ASSIGNMENT_QUERY_KEYS.submissions.list(params),
    queryFn: async () => (await assignmentSubmissionsApi.list(params)).data,
    enabled: !!params?.assignment_id,
  });

export const useAssignmentSubmission = (id?: number | string) =>
  useQuery({
    queryKey: LMS_ASSIGNMENT_QUERY_KEYS.submissions.detail(Number(id)),
    queryFn: async () => (await assignmentSubmissionsApi.get(id!)).data,
    enabled: !!id,
  });

export const useLatestSubmission = (assignmentId?: number | string, studentId?: number) =>
  useQuery({
    queryKey: LMS_ASSIGNMENT_QUERY_KEYS.submissions.latest(
      Number(assignmentId),
      studentId
    ),
    queryFn: async () =>
      (await assignmentSubmissionsApi.latest(assignmentId!, studentId)).data,
    enabled: !!assignmentId,
  });

export const useSubmissionHistory = (assignmentId: number | string, studentId: number) =>
  useQuery({
    queryKey: ['lms', 'submissions', 'history', assignmentId, studentId] as const,
    queryFn: async () => (await assignmentSubmissionsApi.history(assignmentId, studentId)).data,
    enabled: !!(assignmentId && studentId),
  });

export const useSubmitAssignment = () => {
  const qc = useQueryClient();
  const notify = useNotificationStore();
  return useMutation({
    mutationFn: (payload: AssignmentSubmissionCreatePayload) =>
      assignmentSubmissionsApi.submit(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_ASSIGNMENT_QUERY_KEYS.submissions.all });
      notify.addNotification({ type: 'success', title: 'Thành công', message: 'Nộp bài tập thành công' });
    },
    onError: (err: Error) => notify.addNotification({ type: 'error', title: 'Lỗi', message: err.message }),
  });
};
