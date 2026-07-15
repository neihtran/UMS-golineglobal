import {
  Student,
  ExternalMapping,
} from '../../../models/index.js';
import { hqnhatSyncService } from '../hqnhatSync.service.js';
import { studentProfileDtoToStudent } from '../hqnhatMapper.js';
import type { StudentProfileDto } from '../../../integrations/hqnhat.types.js';
import type { SyncContext, SyncResult } from '../sync.types.js';
import type { SyncEntity } from '../../../models/SyncConfig.js';

// ─── Sync Students (Sinh viên) → Student ─────────────────────────────────────
// Mapping:
//   StudentProfileDto (10 fields) → Student { code, name, dob, phone, ... }
// API không trả: email, gender, gpa, accumulated_credits, admission_date
// → các fields optional sẽ undefined

const ENTITY: SyncEntity = 'Student';

export async function syncStudents(
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
    const students = await client.fetchAllPages<StudentProfileDto>(
      (page, perPage) => client.listStudents({ page, per_page: perPage }),
      { perPage: 100, maxPages: 50 }
    );

    const existingMappings = await hqnhatSyncService.getAllMappingsForEntity(ENTITY);

    // Build faculty map from ExternalMapping
    const facultyMappings = await ExternalMapping.find({
      source: 'hqnhat',
      entity: 'Faculty',
    }).lean();
    const facultyMap = new Map<number, string>();
    for (const m of facultyMappings) {
      facultyMap.set(m.externalId, m.umsId.toString());
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

    for (const dto of students) {
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
        if (!facultyId) {
          throw new Error(
            `Cannot resolve faculty for faculty_id=${dto.faculty_id}. Run syncFaculties first.`
          );
        }

        const ctxMap = { facultyObjectId: facultyId as any };

        if (!mapping) {
          const data = studentProfileDtoToStudent(dto, ctxMap);
          const doc = await Student.create(data);
          await hqnhatSyncService.upsertMapping({
            entity: ENTITY,
            externalId: dto.id,
            umsId: doc._id.toString(),
            hash,
            metadata: {
              studentCode: dto.student_code,
              cohort: dto.cohort,
              facultyId: dto.faculty_id,
            },
          });
          created++;
        } else if (mapping.hash !== hash) {
          if (config.mode === 'READ_ONLY') {
            skipped++;
            continue;
          }
          const data = studentProfileDtoToStudent(dto, ctxMap);
          await Student.findByIdAndUpdate(mapping.umsId, { $set: data });
          await hqnhatSyncService.upsertMapping({
            entity: ENTITY,
            externalId: dto.id,
            umsId: mapping.umsId,
            hash,
            metadata: {
              studentCode: dto.student_code,
              cohort: dto.cohort,
              facultyId: dto.faculty_id,
            },
          });
          updated++;
        } else {
          skipped++;
        }
      } catch (err) {
        console.error(`[syncStudents] Error for id=${dto.id}:`, (err as Error).message);
        errors++;
      }
    }

    // MIRROR mode: deactivate missing
    let deleted = 0;
    if (config.mode === 'MIRROR' && !ctx.dryRun) {
      for (const [externalId, mapping] of existingMappings) {
        if (!seenExternalIds.has(externalId)) {
          await Student.findByIdAndUpdate(mapping.umsId, {
            $set: { status: 'reserved' }, // Đánh dấu là reserved thay vì xóa
          });
          await hqnhatSyncService.removeMapping(ENTITY, externalId);
          deleted++;
        }
      }
    }

    return {
      status: errors > 0 && created + updated === 0 ? 'failed' : 'success',
      total: students.length,
      created,
      updated,
      deleted,
      skipped_count: skipped,
      errors,
      message: `Synced ${created} new, ${updated} updated, ${deleted} archived, ${errors} errors, ${skipped} unchanged`,
    };
  });
}