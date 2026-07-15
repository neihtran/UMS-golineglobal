// @ts-nocheck
// ─── SyncRetryService (Dead Letter Queue) ───────────────────────────────────
// Quản lý các sync failure: retry với exponential backoff, sau khi hết
// maxAttempts thì chuyển sang 'dead_letter' (admin xử lý thủ công).
//
// Luồng:
//   1. Job fail → recordFailure() → status='pending', attempts=0
//   2. Cron job retryPendingFailures() → chạy lại job (status='retrying')
//   3. Nếu success → status='resolved'; nếu fail → tăng attempts
//   4. Khi attempts >= maxAttempts → status='dead_letter'
//
// Exponential backoff: nextRetryAt = now + 2^attempts * 30s (cap 30min)

import { SyncFailure } from '../../models/index.js';
import type { SyncEntity } from '../../models/SyncConfig.js';
import type { SyncResult } from './sync.types.js';
import {
  syncFaculties,
  syncMajors,
  syncCourses,
  syncCurriculums,
  syncStudentClasses,
  syncStudents,
} from './jobs/index.js';

const JOB_MAP: Record<SyncEntity, (ctx?: any) => Promise<SyncResult>> = {
  Faculty: syncFaculties,
  Major: syncMajors,
  CourseGroup: async () => ({
    entity: 'CourseGroup' as SyncEntity,
    source: 'hqnhat',
    mode: 'DISABLED' as const,
    status: 'skipped' as const,
    startedAt: new Date(),
    completedAt: new Date(),
    durationMs: 0,
    message: 'Not implemented',
  }),
  Course: syncCourses,
  Curriculum: syncCurriculums,
  StudentClass: syncStudentClasses,
  Student: syncStudents,
};

const DEFAULT_MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 30_000; // 30s
const MAX_DELAY_MS = 30 * 60 * 1000; // 30 phút

export interface RecordFailureOptions {
  source: string;
  entity: SyncEntity;
  error: Error;
  payload?: Record<string, unknown>;
  maxAttempts?: number;
}

/**
 * Ghi nhận 1 sync failure. Nếu đã có failure pending cho (source, entity)
 * thì update thay vì tạo mới (tránh duplicate).
 */
export async function recordFailure(opts: RecordFailureOptions): Promise<void> {
  const maxAttempts = opts.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const existing = await SyncFailure.findOne({
    source: opts.source,
    entity: opts.entity,
    status: { $in: ['pending', 'retrying'] },
  });

  if (existing) {
    existing.attempts += 1;
    existing.lastError = opts.error.message;
    existing.errorStack = opts.error.stack;
    existing.payload = opts.payload;
    existing.lastAttemptAt = new Date();
    if (existing.attempts >= existing.maxAttempts) {
      existing.status = 'dead_letter';
      existing.resolvedAt = new Date();
      existing.notes = `Exceeded maxAttempts (${existing.maxAttempts}). Auto-moved to dead_letter.`;
    } else {
      existing.status = 'pending';
      existing.nextRetryAt = computeNextRetry(existing.attempts);
    }
    await existing.save();
    return;
  }

  // Create new failure record
  await SyncFailure.create({
    source: opts.source,
    entity: opts.entity,
    status: 'pending',
    attempts: 1,
    maxAttempts,
    lastError: opts.error.message,
    errorStack: opts.error.stack,
    payload: opts.payload,
    nextRetryAt: computeNextRetry(1),
    lastAttemptAt: new Date(),
  });
}

/**
 * Tính thời điểm retry kế tiếp (exponential backoff).
 * attempt=1 → 30s
 * attempt=2 → 60s
 * attempt=3 → 2min
 * attempt=4 → 4min
 * attempt=5 → 8min
 * cap 30min
 */
export function computeNextRetry(attempts: number): Date {
  const delay = Math.min(BASE_DELAY_MS * Math.pow(2, attempts - 1), MAX_DELAY_MS);
  return new Date(Date.now() + delay);
}

/**
 * Retry tất cả failures pending và đã đến nextRetryAt.
 * Trả về số lượng đã retry thành công / thất bại.
 */
export async function retryPendingFailures(
  source: string = 'hqnhat'
): Promise<{ retried: number; succeeded: number; failed: number; deadLettered: number }> {
  const now = new Date();
  const failures = await SyncFailure.find({
    source,
    status: 'pending',
    $or: [
      { nextRetryAt: { $lte: now } },
      { nextRetryAt: { $exists: false } },
    ],
  }).limit(50); // batch limit

  let succeeded = 0;
  let failed = 0;
  let deadLettered = 0;

  for (const failure of failures) {
    const job = JOB_MAP[failure.entity as SyncEntity];
    if (!job) {
      failure.notes = `No job handler for entity ${failure.entity}`;
      failure.status = 'dead_letter';
      failure.resolvedAt = new Date();
      await failure.save();
      deadLettered++;
      continue;
    }

    failure.status = 'retrying';
    failure.lastAttemptAt = new Date();
    await failure.save();

    try {
      const result = await job({ triggeredBy: 'retry', dryRun: false });
      if (result.status === 'success' || result.status === 'skipped') {
        failure.status = 'resolved';
        failure.resolvedAt = new Date();
        failure.notes = `Retry succeeded. ${result.message || ''}`.trim();
        await failure.save();
        succeeded++;
      } else {
        // Still failing
        failure.attempts += 1;
        failure.lastError = result.error || 'Unknown failure';
        if (failure.attempts >= failure.maxAttempts) {
          failure.status = 'dead_letter';
          failure.resolvedAt = new Date();
          failure.notes = `Exceeded maxAttempts (${failure.maxAttempts}) after retry. Last error: ${failure.lastError}`;
          deadLettered++;
        } else {
          failure.status = 'pending';
          failure.nextRetryAt = computeNextRetry(failure.attempts);
        }
        await failure.save();
        failed++;
      }
    } catch (err) {
      // Job crashed
      failure.attempts += 1;
      failure.lastError = err instanceof Error ? err.message : String(err);
      failure.errorStack = err instanceof Error ? err.stack : undefined;
      if (failure.attempts >= failure.maxAttempts) {
        failure.status = 'dead_letter';
        failure.resolvedAt = new Date();
        deadLettered++;
      } else {
        failure.status = 'pending';
        failure.nextRetryAt = computeNextRetry(failure.attempts);
      }
      await failure.save();
      failed++;
    }
  }

  return { retried: failures.length, succeeded, failed, deadLettered };
}

/**
 * List dead-letter failures cho admin dashboard.
 */
export async function listDeadLetters(source: string = 'hqnhat', limit: number = 50) {
  return SyncFailure.find({ source, status: 'dead_letter' })
    .sort({ resolvedAt: -1 })
    .limit(limit)
    .lean();
}

/**
 * Admin manually mark dead-letter as resolved.
 */
export async function resolveDeadLetter(
  failureId: string,
  userId: string,
  notes?: string
): Promise<void> {
  await SyncFailure.findByIdAndUpdate(failureId, {
    $set: {
      status: 'resolved',
      resolvedAt: new Date(),
      resolvedBy: userId,
      notes: notes || 'Manually resolved by admin',
    },
  });
}

/**
 * Get retry stats cho dashboard.
 */
export async function getRetryStats(source: string = 'hqnhat') {
  const [pending, retrying, resolved, deadLetter] = await Promise.all([
    SyncFailure.countDocuments({ source, status: 'pending' }),
    SyncFailure.countDocuments({ source, status: 'retrying' }),
    SyncFailure.countDocuments({ source, status: 'resolved' }),
    SyncFailure.countDocuments({ source, status: 'dead_letter' }),
  ]);

  return { pending, retrying, resolved, dead_letter: deadLetter };
}
