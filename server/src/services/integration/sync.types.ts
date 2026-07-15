// ─── Sync Types ──────────────────────────────────────────────────────────────
// Common types cho sync orchestration layer

import type { SyncEntity, SyncMode } from '../../models/SyncConfig.js';

export interface SyncResult {
  entity: SyncEntity;
  source: string;
  mode: SyncMode;
  status: 'success' | 'failed' | 'skipped';
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  total?: number;
  created?: number;
  updated?: number;
  deleted?: number;
  skipped_count?: number;
  errors?: number;
  error?: string;
  message?: string;
}

export interface SyncContext {
  triggeredBy: 'cron' | 'manual' | 'init' | 'migration' | 'retry';
  userId?: string;
  dryRun?: boolean;
  forceFullSync?: boolean;
}

export interface SyncConfigServiceOptions {
  defaultMode?: SyncMode;
}

export const DEFAULT_SYNC_MODES: Record<SyncEntity, SyncMode> = {
  Faculty: 'MIRROR',
  Major: 'MIRROR',
  CourseGroup: 'MIRROR',
  Course: 'MIRROR',
  Curriculum: 'MIRROR',
  StudentClass: 'MIRROR',
  Student: 'MASTER',
};

export const ENTITY_TO_UMS_MODEL: Record<SyncEntity, string> = {
  Faculty: 'Department',
  Major: 'Major',
  CourseGroup: 'CourseGroup',
  Course: 'Subject',
  Curriculum: 'Curriculum',
  StudentClass: 'StudentClass',
  Student: 'Student',
};