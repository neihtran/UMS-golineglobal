// ─── LMS Part 5: Attendance Hooks ─────────────────────────────────────────────────
// TanStack Query hooks for Attendance Sessions & Records

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  attendanceSessionsApi,
  attendanceRecordsApi,
} from '@/services/lmsApi';
import type {
  AttendanceRecordListParams,
  AttendanceRecordUpdatePayload,
  AttendanceSession,
  AttendanceSessionCreatePayload,
  AttendanceSessionListParams,
  AttendanceSessionUpdatePayload,
  AttendanceSummary,
} from '@/types/lms.types';

// ─── Query Keys ─────────────────────────────────────────────────────────────────
export const LMS_ATTENDANCE_QUERY_KEYS = {
  sessions: {
    all: ['lms', 'attendance-sessions'] as const,
    list: (params?: AttendanceSessionListParams) =>
      ['lms', 'attendance-sessions', 'list', params ?? {}] as const,
    detail: (id: number) =>
      ['lms', 'attendance-sessions', 'detail', id] as const,
    qrToken: (id: number) =>
      ['lms', 'attendance-sessions', 'qr-token', id] as const,
  },
  records: {
    all: ['lms', 'attendance-records'] as const,
    list: (params?: AttendanceRecordListParams) =>
      ['lms', 'attendance-records', 'list', params ?? {}] as const,
    detail: (id: number) =>
      ['lms', 'attendance-records', 'detail', id] as const,
    summary: (sessionId: number) =>
      ['lms', 'attendance-records', 'summary', sessionId] as const,
  },
};

// ─── Attendance Sessions ────────────────────────────────────────────────────────────
export const useAttendanceSessions = (params?: AttendanceSessionListParams) =>
  useQuery({
    queryKey: LMS_ATTENDANCE_QUERY_KEYS.sessions.list(params),
    queryFn: async () => (await attendanceSessionsApi.list(params)).data,
    enabled: !!params?.learning_course_id,
  });

export const useAttendanceSession = (id?: number | string) =>
  useQuery({
    queryKey: LMS_ATTENDANCE_QUERY_KEYS.sessions.detail(Number(id)),
    queryFn: async () => (await attendanceSessionsApi.get(id!)).data,
    enabled: !!id,
  });

export const useAttendanceSessionQrToken = (sessionId?: number | string, enabled = false) =>
  useQuery({
    queryKey: LMS_ATTENDANCE_QUERY_KEYS.sessions.qrToken(Number(sessionId)),
    queryFn: async () => (await attendanceSessionsApi.getQrToken(sessionId!)).data,
    enabled: enabled && !!sessionId,
    refetchInterval: false, // Manual refresh only
  });

export const useAttendanceSummary = (sessionId?: number | string) =>
  useQuery({
    queryKey: LMS_ATTENDANCE_QUERY_KEYS.records.summary(Number(sessionId)),
    queryFn: async () => (await attendanceRecordsApi.getSessionSummary(sessionId!)).data,
    enabled: !!sessionId,
  });

export const useCreateAttendanceSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AttendanceSessionCreatePayload) =>
      attendanceSessionsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_ATTENDANCE_QUERY_KEYS.sessions.all });
    },
  });
};

export const useUpdateAttendanceSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AttendanceSessionUpdatePayload }) =>
      attendanceSessionsApi.update(id, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: LMS_ATTENDANCE_QUERY_KEYS.sessions.all });
      qc.invalidateQueries({ queryKey: LMS_ATTENDANCE_QUERY_KEYS.sessions.detail(vars.id) });
    },
  });
};

export const useDeleteAttendanceSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => attendanceSessionsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LMS_ATTENDANCE_QUERY_KEYS.sessions.all });
    },
  });
};

export const useInitializeAttendanceRecords = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: number | string) =>
      attendanceSessionsApi.initializeRecords(sessionId),
    onSuccess: (_d, sessionId) => {
      qc.invalidateQueries({ queryKey: LMS_ATTENDANCE_QUERY_KEYS.records.all });
      qc.invalidateQueries({ queryKey: LMS_ATTENDANCE_QUERY_KEYS.records.list() });
      qc.invalidateQueries({ queryKey: LMS_ATTENDANCE_QUERY_KEYS.records.summary(Number(sessionId)) });
    },
  });
};

export const useBulkUpdateAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      records,
    }: {
      sessionId: number | string;
      records: Parameters<typeof attendanceSessionsApi.bulkUpdateRecords>[1];
    }) => attendanceSessionsApi.bulkUpdateRecords(sessionId, records),
    onSuccess: (_d, { sessionId }) => {
      qc.invalidateQueries({ queryKey: LMS_ATTENDANCE_QUERY_KEYS.records.all });
      qc.invalidateQueries({ queryKey: LMS_ATTENDANCE_QUERY_KEYS.records.summary(Number(sessionId)) });
    },
  });
};

// ─── Attendance Records ─────────────────────────────────────────────────────────────
export const useAttendanceRecords = (params?: AttendanceRecordListParams) =>
  useQuery({
    queryKey: LMS_ATTENDANCE_QUERY_KEYS.records.list(params),
    queryFn: async () => (await attendanceRecordsApi.list(params)).data,
    enabled: !!params?.attendance_session_id,
  });

export const useAttendanceRecord = (id?: number | string) =>
  useQuery({
    queryKey: LMS_ATTENDANCE_QUERY_KEYS.records.detail(Number(id)),
    queryFn: async () => (await attendanceRecordsApi.get(id!)).data,
    enabled: !!id,
  });

export const useUpdateAttendanceRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: AttendanceRecordUpdatePayload;
    }) => attendanceRecordsApi.update(id, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: LMS_ATTENDANCE_QUERY_KEYS.records.all });
      qc.invalidateQueries({ queryKey: LMS_ATTENDANCE_QUERY_KEYS.records.detail(Number(vars.id)) });
      // Also refresh summary for the session
      qc.invalidateQueries({
        queryKey: ['lms', 'attendance-records', 'summary'],
        refetchType: 'all',
      });
    },
  });
};
