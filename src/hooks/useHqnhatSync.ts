// ─── useHqnhatSync ──────────────────────────────────────────────────────────
// TanStack Query hooks cho Hqnhat integration API.
// Endpoints: /api/int/hqnhat/*

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { useNotificationStore } from '@/stores/notificationStore';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

// ─── Types ──────────────────────────────────────────────────────────────────

export type SyncEntity =
  | 'Faculty'
  | 'Major'
  | 'CourseGroup'
  | 'Course'
  | 'Curriculum'
  | 'StudentClass'
  | 'Student';

export type SyncMode = 'MASTER' | 'MIRROR' | 'READ_ONLY' | 'DISABLED';

export interface SyncConfig {
  _id: string;
  source: string;
  entity: SyncEntity;
  mode: SyncMode;
  enabled: boolean;
  cronExpression?: string;
  conflictStrategy: string;
  lastRunAt?: string;
  lastRunStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncResult {
  entity: SyncEntity;
  source: string;
  mode: SyncMode;
  status: 'success' | 'failed' | 'skipped';
  total: number;
  created: number;
  updated: number;
  deleted: number;
  skipped_count?: number;
  errors: number;
  message?: string;
  error?: string;
  durationMs: number;
  startedAt: string;
  completedAt: string;
}

export interface IntegrationLog {
  _id: string;
  source: string;
  event: string;
  entity?: SyncEntity;
  status: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface RetryStats {
  pending: number;
  retrying: number;
  resolved: number;
  dead_letter: number;
}

export interface SyncFailure {
  _id: string;
  source: string;
  entity: SyncEntity;
  status: 'pending' | 'retrying' | 'resolved' | 'dead_letter';
  attempts: number;
  maxAttempts: number;
  lastError: string;
  nextRetryAt?: string;
  lastAttemptAt?: string;
  resolvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HqnhatHealthStatus {
  success: boolean;
  data: {
    status: 'ok' | 'down';
    latencyMs?: number;
    apiUrl: string;
    error?: string;
  };
}

// ─── Query keys ─────────────────────────────────────────────────────────────

export const HQNHAT_QUERY_KEYS = {
  health: ['hqnhat', 'health'] as const,
  configs: ['hqnhat', 'configs'] as const,
  logs: (params?: unknown) => ['hqnhat', 'logs', params] as const,
  mappingsStats: ['hqnhat', 'mappings', 'stats'] as const,
  mappings: (params?: unknown) => ['hqnhat', 'mappings', params] as const,
  retryStats: ['hqnhat', 'retry', 'stats'] as const,
  failures: (params?: unknown) => ['hqnhat', 'failures', params] as const,
  deadLetters: ['hqnhat', 'retry', 'dead-letters'] as const,
};

// ─── 1. Health Check ────────────────────────────────────────────────────────

export function useHqnhatHealth(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: HQNHAT_QUERY_KEYS.health,
    queryFn: async () => {
      const res = await api.get<ApiResponse<HqnhatHealthStatus['data']>>('/int/hqnhat/health');
      return res.data.data;
    },
    refetchInterval: 60_000, // 1 min
    enabled: options?.enabled ?? true,
    retry: false,
  });
}

// ─── 2. Sync Configs ────────────────────────────────────────────────────────

export function useHqnhatConfigs() {
  return useQuery({
    queryKey: HQNHAT_QUERY_KEYS.configs,
    queryFn: async () => {
      const res = await api.get<ApiResponse<SyncConfig[]>>('/int/hqnhat/configs');
      return res.data.data;
    },
    staleTime: 30_000,
  });
}

export function useUpdateSyncConfig() {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: async (input: { entity: SyncEntity; mode: SyncMode; enabled?: boolean }) => {
      const res = await api.put<ApiResponse<SyncConfig>>(
        `/int/hqnhat/configs/${input.entity}`,
        { mode: input.mode, enabled: input.enabled ?? true }
      );
      return res.data.data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.configs });
      addNotification({
        type: 'success',
        title: 'Cập nhật cấu hình sync',
        message: `Đã cập nhật ${vars.entity} → ${vars.mode}`,
      });
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi cập nhật',
        message: err?.response?.data?.message || 'Không thể cập nhật',
      });
    },
  });
}

// ─── 3. Trigger Sync ────────────────────────────────────────────────────────

export interface TriggerSyncInput {
  entity: SyncEntity;
  dryRun?: boolean;
  forceFullSync?: boolean;
}

export function useTriggerSync() {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: async (input: TriggerSyncInput) => {
      const res = await api.post<ApiResponse<SyncResult>>(
        `/int/hqnhat/sync/${input.entity}`,
        { dryRun: input.dryRun ?? false, forceFullSync: input.forceFullSync ?? false }
      );
      return res.data.data;
    },
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ['hqnhat'] });
      addNotification({
        type: data.status === 'success' ? 'success' : 'warning',
        title: `Sync ${vars.entity}`,
        message: `${data.created ?? 0} new, ${data.updated ?? 0} updated, ${data.errors ?? 0} errors`,
      });
    },
    onError: (err: any, vars) => {
      addNotification({
        type: 'error',
        title: `Lỗi sync ${vars.entity}`,
        message: err?.response?.data?.message || 'Không thể sync',
      });
    },
  });
}

export function useTriggerAllSyncs() {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: async (input: { dryRun?: boolean } = {}) => {
      const res = await api.post<ApiResponse<SyncResult[]>>(
        '/int/hqnhat/sync-all',
        { dryRun: input.dryRun ?? false }
      );
      return res.data.data;
    },
    onSuccess: (results) => {
      qc.invalidateQueries({ queryKey: ['hqnhat'] });
      const ok = results.filter((r) => r.status === 'success').length;
      addNotification({
        type: ok === results.length ? 'success' : 'warning',
        title: 'Sync tất cả',
        message: `${ok}/${results.length} entities thành công`,
      });
    },
  });
}

// ─── 4. Logs ────────────────────────────────────────────────────────────────

export function useHqnhatLogs(params?: { entity?: SyncEntity; limit?: number }) {
  return useQuery({
    queryKey: HQNHAT_QUERY_KEYS.logs(params),
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<IntegrationLog>>(
        '/int/hqnhat/logs',
        { params } as any
      );
      return res.data;
    },
    refetchInterval: 30_000,
  });
}

// ─── 5. Mappings ────────────────────────────────────────────────────────────

export interface MappingStats {
  total: number;
  byEntity: Record<string, number>;
}

export function useHqnhatMappingsStats() {
  return useQuery({
    queryKey: HQNHAT_QUERY_KEYS.mappingsStats,
    queryFn: async () => {
      const res = await api.get<ApiResponse<MappingStats>>('/int/hqnhat/mappings/stats');
      return res.data.data;
    },
    staleTime: 60_000,
  });
}

export function useHqnhatMappings(params?: {
  entity?: SyncEntity;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: HQNHAT_QUERY_KEYS.mappings(params),
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<unknown>>(
        '/int/hqnhat/mappings',
        { params } as any
      );
      return res.data;
    },
  });
}

export function useDeleteMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/int/hqnhat/mappings/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hqnhat', 'mappings'] });
    },
  });
}

// ─── 6. Retry Queue ────────────────────────────────────────────────────────

export function useRetryStats() {
  return useQuery({
    queryKey: HQNHAT_QUERY_KEYS.retryStats,
    queryFn: async () => {
      const res = await api.get<ApiResponse<RetryStats>>('/int/hqnhat/retry/stats');
      return res.data.data;
    },
    refetchInterval: 30_000,
  });
}

export function useRunRetry() {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiResponse<{ retried: number; succeeded: number; failed: number; deadLettered: number }>>(
        '/int/hqnhat/retry/run'
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['hqnhat'] });
      addNotification({
        type: 'success',
        title: 'Retry completed',
        message: `Retried: ${data.retried}, Succeeded: ${data.succeeded}, Failed: ${data.failed}`,
      });
    },
  });
}

export function useDeadLetters() {
  return useQuery({
    queryKey: HQNHAT_QUERY_KEYS.deadLetters,
    queryFn: async () => {
      const res = await api.get<ApiResponse<SyncFailure[]>>('/int/hqnhat/retry/dead-letters');
      return res.data.data;
    },
  });
}

export function useResolveDeadLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; notes?: string }) => {
      await api.post(`/int/hqnhat/retry/dead-letters/${input.id}/resolve`, {
        notes: input.notes,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hqnhat'] });
    },
  });
}

export function useFailures(params?: { status?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: HQNHAT_QUERY_KEYS.failures(params),
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<SyncFailure>>(
        '/int/hqnhat/failures',
        { params } as any
      );
      return res.data;
    },
    refetchInterval: 30_000,
  });
}
