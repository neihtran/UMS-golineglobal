import {
  StudentClass,
  ExternalMapping,
} from '../../../models/index.js';
import { hqnhatSyncService } from '../hqnhatSync.service.js';
import { studentClassDtoToStudentClass } from '../hqnhatMapper.js';
import type { StudentClassDto } from '../../../integrations/hqnhat.types.js';
import type { SyncContext, SyncResult } from '../sync.types.js';
import type { SyncEntity } from '../../../models/SyncConfig.js';

// ─── Sync StudentClasses (Lớp sinh viên) → StudentClass ─────────────────────
// Mapping:
//   StudentClassDto { id, name, cohort, faculty_id, major_id,
//                      academic_advisor_id, status }
//   → StudentClass { code, name, cohort, faculty, major, ... }

const ENTITY: SyncEntity = 'StudentClass';

export async function syncStudentClasses(
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
    const classes = await client.fetchAllPages<StudentClassDto>(
      (page, perPage) => client.listStudentClasses({ page, per_page: perPage }),
      { perPage: 100, maxPages: 10 }
    );

    const existingMappings = await hqnhatSyncService.getAllMappingsForEntity(ENTITY);

    // Build faculty/major maps from ExternalMapping
    const facultyMappings = await ExternalMapping.find({
      source: 'hqnhat',
      entity: 'Faculty',
    }).lean();
    const facultyMap = new Map<number, string>();
    for (const m of facultyMappings) {
      facultyMap.set(m.externalId, m.umsId.toString());
    }

    const majorMappings = await ExternalMapping.find({
      source: 'hqnhat',
      entity: 'Major',
    }).lean();
    const majorMap = new Map<number, string>();
    for (const m of majorMappings) {
      majorMap.set(m.externalId, m.umsId.toString());
    }

    // Fallback: lấy bất kỳ faculty/major active nào
    const { Department, Major } = await import('../../../models/index.js');
    const defaultFaculty = await Department.findOne({ type: 'faculty', isActive: true })
      .select('_id')
      .lean();
    const defaultMajor = await Major.findOne({ isActive: true }).select('_id').lean();

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    const seenExternalIds = new Set<number>();

    for (const dto of classes) {
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

        const facultyId = facultyMap.get(dto.faculty_id) || (defaultFaculty?._id?.toString());
        const majorId = majorMap.get(dto.major_id) || (defaultMajor?._id?.toString());
        if (!facultyId || !majorId) {
          throw new Error(
            `Cannot resolve faculty/major for faculty_id=${dto.faculty_id}, major_id=${dto.major_id}. Run syncFaculties + syncMajors first.`
          );
        }

        const ctxMap = {
          facultyObjectId: facultyId as any,
          majorObjectId: majorId as any,
          // advisor chưa sync, để undefined
        };

        if (!mapping) {
          const data = studentClassDtoToStudentClass(dto, ctxMap);
          const doc = await StudentClass.create(data);
          await hqnhatSyncService.upsertMapping({
            entity: ENTITY,
            externalId: dto.id,
            umsId: doc._id.toString(),
            hash,
            metadata: { name: dto.name, cohort: dto.cohort },
          });
          created++;
        } else if (mapping.hash !== hash) {
          if (config.mode === 'READ_ONLY') {
            skipped++;
            continue;
          }
          const data = studentClassDtoToStudentClass(dto, ctxMap);
          await StudentClass.findByIdAndUpdate(mapping.umsId, { $set: data });
          await hqnhatSyncService.upsertMapping({
            entity: ENTITY,
            externalId: dto.id,
            umsId: mapping.umsId,
            hash,
            metadata: { name: dto.name, cohort: dto.cohort },
          });
          updated++;
        } else {
          skipped++;
        }
      } catch (err) {
        console.error(`[syncStudentClasses] Error for id=${dto.id}:`, (err as Error).message);
        errors++;
      }
    }

    // MIRROR mode: deactivate missing
    let deleted = 0;
    if (config.mode === 'MIRROR' && !ctx.dryRun) {
      for (const [externalId, mapping] of existingMappings) {
        if (!seenExternalIds.has(externalId)) {
          await StudentClass.findByIdAndUpdate(mapping.umsId, { $set: { isActive: false } });
          await hqnhatSyncService.removeMapping(ENTITY, externalId);
          deleted++;
        }
      }
    }

    return {
      status: errors > 0 && created + updated === 0 ? 'failed' : 'success',
      total: classes.length,
      created,
      updated,
      deleted,
      skipped_count: skipped,
      errors,
      message: `Synced ${created} new, ${updated} updated, ${deleted} deactivated, ${errors} errors, ${skipped} unchanged`,
    };
  });
}