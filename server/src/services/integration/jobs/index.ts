// ─── Sync Jobs Index ────────────────────────────────────────────────────────
import type { SyncEntity } from '../../../models/SyncConfig.js';
import { syncFaculties } from './syncFaculties.job.js';
import { syncMajors } from './syncMajors.job.js';
import { syncCourses } from './syncCourses.job.js';
import { syncCurriculums } from './syncCurriculums.job.js';
import { syncStudentClasses } from './syncStudentClasses.job.js';
import { syncStudents } from './syncStudents.job.js';
import type { SyncResult, SyncContext } from '../sync.types.js';

export {
  syncFaculties,
  syncMajors,
  syncCourses,
  syncCurriculums,
  syncStudentClasses,
  syncStudents,
};

// Map entity → job function
// Thứ tự quan trọng: chạy parent trước (faculties, majors) → derived sau (curriculums, classes, students)
export const SYNC_JOBS: Record<string, (ctx?: SyncContext) => Promise<SyncResult>> = {
  Faculty: syncFaculties,
  Major: syncMajors,
  Course: syncCourses,
  Curriculum: syncCurriculums,
  StudentClass: syncStudentClasses,
  Student: syncStudents,
};

/**
 * Run all registered sync jobs sequentially (an toàn cho DB).
 * Nếu 1 job fail sẽ log và tiếp tục.
 */
export async function runAllSyncJobs(
  ctx: SyncContext = { triggeredBy: 'manual' }
): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  for (const [entity, job] of Object.entries(SYNC_JOBS)) {
    try {
      console.log(`[SyncScheduler] Running ${entity}...`);
      const result = await job(ctx);
      results.push(result);
      console.log(
        `[SyncScheduler] ${entity} → ${result.status} (${result.durationMs}ms)`
      );
    } catch (err) {
      console.error(`[SyncScheduler] ${entity} crashed:`, err);
      results.push({
        entity: entity as SyncEntity,
        source: 'hqnhat',
        mode: 'DISABLED',
        status: 'failed',
        startedAt: new Date(),
        completedAt: new Date(),
        durationMs: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return results;
}