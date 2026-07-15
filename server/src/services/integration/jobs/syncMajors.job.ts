import {
  Department,
  Major,
  ExternalMapping,
} from '../../../models/index.js';
import { hqnhatSyncService } from '../hqnhatSync.service.js';
import { majorDtoToMajor } from '../hqnhatMapper.js';
import type { MajorDto } from '../../../integrations/hqnhat.types.js';
import type { SyncContext, SyncResult } from '../sync.types.js';
import type { SyncEntity } from '../../../models/SyncConfig.js';

// ─── Sync Majors (Ngành) → Major ────────────────────────────────────────────
// Lưu ý: Major của UMS cần liên kết với Department (faculty).
// External API: MajorDto không có faculty_id, mà có thể suy ra từ context.
// Cách xử lý:
//   - Trong metadata của SyncConfig, có thể set "facultyExternalId" → mapping.
//   - Mặc định: gán vào Department đầu tiên có type=faculty (fallback).
//   - Nếu API trả về faculty_id trong tương lai, sẽ update lại.

const ENTITY: SyncEntity = 'Major';

interface MajorSyncContext extends SyncContext {
  /** Override faculty mapping nếu API trả faculty_id mà mình chưa biết */
  facultyResolver?: (dto: MajorDto) => Promise<string | null>;
}

export async function syncMajors(
  ctx: MajorSyncContext = { triggeredBy: 'cron' }
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
    const majors = await client.fetchAllPages<MajorDto>(
      (page, perPage) => client.listMajors({ page, per_page: perPage }),
      { perPage: 100, maxPages: 50 }
    );

    // 2) Lấy existing mappings
    const existingMappings = await hqnhatSyncService.getAllMappingsForEntity(ENTITY);

    // 3) Lấy tất cả faculties (dùng làm default faculty)
    const faculties = await Department.find({ type: 'faculty', isActive: true })
      .select('_id code')
      .lean();
    if (faculties.length === 0) {
      throw new Error('No active faculty (Department type=faculty) found. Run syncFaculties first.');
    }

    // Build mapping từ external faculty_id → UMS ObjectId
    const facultyExternalMap = new Map<number, string>();
    const facultyMappings = await ExternalMapping.find({
      source: 'hqnhat',
      entity: 'Faculty',
    }).lean();
    for (const m of facultyMappings) {
      facultyExternalMap.set(m.externalId, m.umsId.toString());
    }

    // 4) Faculty resolver
    const resolveFaculty = async (dto: MajorDto): Promise<string> => {
      // Custom resolver (nếu MajorDto có field faculty_id ở tương lai)
      if (ctx.facultyResolver) {
        const resolved = await ctx.facultyResolver(dto);
        if (resolved) return resolved;
      }
      // Fallback: lấy faculty đầu tiên
      return (faculties[0]._id as any).toString();
    };

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    const seenExternalIds = new Set<number>();

    for (const dto of majors) {
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

        const facultyId = await resolveFaculty(dto);

        if (!mapping) {
          // CREATE
          const majorData = majorDtoToMajor(dto, facultyId as any);
          const major = await Major.create(majorData);
          await hqnhatSyncService.upsertMapping({
            entity: ENTITY,
            externalId: dto.id,
            umsId: major._id.toString(),
            hash,
            metadata: {
              code: dto.code,
              name: dto.name,
              facultyId,
            },
          });
          created++;
        } else if (mapping.hash !== hash) {
          // UPDATE
          if (config.mode === 'READ_ONLY') {
            skipped++;
            continue;
          }
          const majorData = majorDtoToMajor(dto, facultyId as any);
          await Major.findByIdAndUpdate(mapping.umsId, { $set: majorData });
          await hqnhatSyncService.upsertMapping({
            entity: ENTITY,
            externalId: dto.id,
            umsId: mapping.umsId,
            hash,
            metadata: {
              code: dto.code,
              name: dto.name,
              facultyId,
            },
          });
          updated++;
        } else {
          skipped++;
        }
      } catch (err) {
        console.error(`[syncMajors] Error for major id=${dto.id}:`, err);
        errors++;
      }
    }

    // 5) MIRROR: deactivate majors không còn ở external
    let deleted = 0;
    if (config.mode === 'MIRROR' && !ctx.dryRun) {
      for (const [externalId, mapping] of existingMappings) {
        if (!seenExternalIds.has(externalId)) {
          await Major.findByIdAndUpdate(mapping.umsId, { $set: { isActive: false } });
          await hqnhatSyncService.removeMapping(ENTITY, externalId);
          deleted++;
        }
      }
    }

    return {
      status: errors > 0 && created + updated === 0 ? 'failed' : 'success',
      total: majors.length,
      created,
      updated,
      deleted,
      skipped_count: skipped,
      errors,
      message: `Synced ${created} new, ${updated} updated, ${deleted} deactivated, ${errors} errors, ${skipped} unchanged`,
    };
  });
}