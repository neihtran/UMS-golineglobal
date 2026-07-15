import {
  Department,
  Subject,
} from '../../../models/index.js';
import { hqnhatSyncService } from '../hqnhatSync.service.js';
import { courseDtoToSubject } from '../hqnhatMapper.js';
import type { CourseDto } from '../../../integrations/hqnhat.types.js';
import type { SyncContext, SyncResult } from '../sync.types.js';
import type { SyncEntity } from '../../../models/SyncConfig.js';

// ─── Sync Courses (Học phần) → Subject ──────────────────────────────────────
// Mapping:
//   CourseDto { id, code, name, theory/pratical/total_credits, is_active }
//     → Subject { code, name, credits, theoryHours, practiceHours, isActive, department? }

const ENTITY: SyncEntity = 'Course';

interface CourseSyncContext extends SyncContext {
  /** Nếu muốn gán department mặc định cho tất cả courses (vd: khoa CNTT) */
  defaultDepartmentId?: string;
}

export async function syncCourses(
  ctx: CourseSyncContext = { triggeredBy: 'cron' }
): Promise<SyncResult> {
  const config = await hqnhatSyncService.getOrCreateConfig(ENTITY);

  if (!config.enabled) {
    return hqnhatSyncService.skip(ENTITY, config.mode, 'Sync disabled in config');
  }
  if (config.mode === 'DISABLED' || config.mode === 'MASTER') {
    return hqnhatSyncService.skip(ENTITY, config.mode, `Mode=${config.mode} — UMS quản lý`);
  }

  const client = hqnhatSyncService.getClient();
  if (!client) {
    return hqnhatSyncService.runWithGuard(ENTITY, config.mode, async () => {
      throw new Error('HqnhatApiClient not configured');
    });
  }

  return hqnhatSyncService.runWithGuard(ENTITY, config.mode, async () => {
    // 1) Pull courses
    const courses = await client.fetchAllPages<CourseDto>(
      (page, perPage) => client.listCourses({ page, per_page: perPage }),
      { perPage: 100, maxPages: 100 } // 100 pages × 100 = 10k courses
    );

    // 2) Existing mappings
    const existingMappings = await hqnhatSyncService.getAllMappingsForEntity(ENTITY);

    // 3) Resolve default department nếu có
    let defaultDepartmentId: string | null = ctx.defaultDepartmentId ?? null;
    if (!defaultDepartmentId) {
      const defaultFaculty = await Department.findOne({ type: 'faculty', isActive: true })
        .select('_id')
        .lean();
      defaultDepartmentId = defaultFaculty ? (defaultFaculty._id as any).toString() : null;
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    const seenExternalIds = new Set<number>();

    for (const dto of courses) {
      seenExternalIds.add(dto.id);
      const mapping = existingMappings.get(dto.id);
      const hash = hqnhatSyncService.computeHash(dto);

      try {
        if (ctx.dryRun) {
          if (!mapping) created++;
          else if (mapping.hash !== hash) updated++;
          else skipped++;
          continue;
        }

        if (!mapping) {
          // CREATE
          const subjectData = courseDtoToSubject(dto, defaultDepartmentId as any);
          const subject = await Subject.create({
            ...subjectData,
            code: subjectData.code!.toUpperCase(),
          } as any);
          await hqnhatSyncService.upsertMapping({
            entity: ENTITY,
            externalId: dto.id,
            umsId: subject._id.toString(),
            hash,
            metadata: {
              code: dto.code,
              name: dto.name,
              credits: dto.total_credits,
            },
          });
          created++;
        } else if (mapping.hash !== hash) {
          // UPDATE
          if (config.mode === 'READ_ONLY') {
            skipped++;
            continue;
          }
          const subjectData = courseDtoToSubject(dto, defaultDepartmentId as any);
          await Subject.findByIdAndUpdate(mapping.umsId, { $set: subjectData });
          await hqnhatSyncService.upsertMapping({
            entity: ENTITY,
            externalId: dto.id,
            umsId: mapping.umsId,
            hash,
            metadata: {
              code: dto.code,
              name: dto.name,
              credits: dto.total_credits,
            },
          });
          updated++;
        } else {
          skipped++;
        }
      } catch (err) {
        // Có thể do duplicate code (Subject có unique index trên code)
        console.error(`[syncCourses] Error for course id=${dto.id} code=${dto.code}:`, err);
        errors++;
      }
    }

    // 4) MIRROR: deactivate courses không còn ở external
    let deleted = 0;
    if (config.mode === 'MIRROR' && !ctx.dryRun) {
      for (const [externalId, mapping] of existingMappings) {
        if (!seenExternalIds.has(externalId)) {
          await Subject.findByIdAndUpdate(mapping.umsId, { $set: { isActive: false } });
          await hqnhatSyncService.removeMapping(ENTITY, externalId);
          deleted++;
        }
      }
    }

    return {
      status: errors > 0 && created + updated === 0 ? 'failed' : 'success',
      total: courses.length,
      created,
      updated,
      deleted,
      skipped_count: skipped,
      errors,
      message: `Synced ${created} new, ${updated} updated, ${deleted} deactivated, ${errors} errors, ${skipped} unchanged`,
    };
  });
}