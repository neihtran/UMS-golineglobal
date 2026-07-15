import {
  Curriculum,
  ExternalMapping,
} from '../../../models/index.js';
import { hqnhatSyncService } from '../hqnhatSync.service.js';
import { curriculumDtoToCurriculum } from '../hqnhatMapper.js';
import type { CurriculumDto } from '../../../integrations/hqnhat.types.js';
import type { SyncContext, SyncResult } from '../sync.types.js';
import type { SyncEntity } from '../../../models/SyncConfig.js';

// ─── Sync Curriculums (Chương trình đào tạo) → Curriculum ───────────────────
// Mapping:
//   CurriculumDto { id, name, major_id, degree_level, training_type,
//                    cohort_year, required_credits, elective_credits }
//   → Curriculum { code, name, department (faculty), major, ... }
// Lưu ý: API không trả faculty_id → derive từ Major mapping

const ENTITY: SyncEntity = 'Curriculum';

export async function syncCurriculums(
  ctx: SyncContext = { triggeredBy: 'cron' }
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
    const curriculums = await client.fetchAllPages<CurriculumDto>(
      (page, perPage) => client.listCurriculums({ page, per_page: perPage }),
      { perPage: 100, maxPages: 10 }
    );

    const existingMappings = await hqnhatSyncService.getAllMappingsForEntity(ENTITY);

    // Build majorId → Major mapping (with faculty) để derive department
    const majorMappings = await ExternalMapping.find({
      source: 'hqnhat',
      entity: 'Major',
    }).lean();
    const majorToFaculty = new Map<number, string>(); // majorExtId → facultyUmsId
    const majorToUms = new Map<number, string>(); // majorExtId → majorUmsId
    for (const m of majorMappings) {
      majorToUms.set(m.externalId, m.umsId.toString());
      if (m.metadata && typeof (m.metadata as any).facultyId === 'string') {
        majorToFaculty.set(m.externalId, (m.metadata as any).facultyId);
      }
    }

    // Fallback: lấy bất kỳ faculty active nào
    const { Department } = await import('../../../models/index.js');
    const defaultFaculty = await Department.findOne({ type: 'faculty', isActive: true })
      .select('_id')
      .lean();

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    const seenExternalIds = new Set<number>();

    for (const dto of curriculums) {
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

        // Resolve department + major
        const facultyId = majorToFaculty.get(dto.major_id) || (defaultFaculty?._id?.toString());
        const majorId = majorToUms.get(dto.major_id);
        if (!facultyId || !majorId) {
          throw new Error(
            `Cannot resolve faculty/major for major_id=${dto.major_id}. Run syncMajors + syncFaculties first.`
          );
        }

        const ctxMap = { facultyObjectId: facultyId as any, majorObjectId: majorId as any };

        if (!mapping) {
          const data = curriculumDtoToCurriculum(dto, ctxMap);
          const doc = await Curriculum.create(data);
          await hqnhatSyncService.upsertMapping({
            entity: ENTITY,
            externalId: dto.id,
            umsId: doc._id.toString(),
            hash,
            metadata: { name: dto.name, majorId: dto.major_id, cohortYear: dto.cohort_year },
          });
          created++;
        } else if (mapping.hash !== hash) {
          if (config.mode === 'READ_ONLY') {
            skipped++;
            continue;
          }
          const data = curriculumDtoToCurriculum(dto, ctxMap);
          await Curriculum.findByIdAndUpdate(mapping.umsId, { $set: data });
          await hqnhatSyncService.upsertMapping({
            entity: ENTITY,
            externalId: dto.id,
            umsId: mapping.umsId,
            hash,
            metadata: { name: dto.name, majorId: dto.major_id, cohortYear: dto.cohort_year },
          });
          updated++;
        } else {
          skipped++;
        }
      } catch (err) {
        console.error(`[syncCurriculums] Error for id=${dto.id}:`, (err as Error).message);
        errors++;
      }
    }

    // MIRROR mode: deactivate missing
    let deleted = 0;
    if (config.mode === 'MIRROR' && !ctx.dryRun) {
      for (const [externalId, mapping] of existingMappings) {
        if (!seenExternalIds.has(externalId)) {
          await Curriculum.findByIdAndUpdate(mapping.umsId, { $set: { status: 'archived' } });
          await hqnhatSyncService.removeMapping(ENTITY, externalId);
          deleted++;
        }
      }
    }

    return {
      status: errors > 0 && created + updated === 0 ? 'failed' : 'success',
      total: curriculums.length,
      created,
      updated,
      deleted,
      skipped_count: skipped,
      errors,
      message: `Synced ${created} new, ${updated} updated, ${deleted} archived, ${errors} errors, ${skipped} unchanged`,
    };
  });
}