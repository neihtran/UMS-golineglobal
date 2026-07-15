import {
  Department,
} from '../../../models/index.js';
import { hqnhatSyncService } from '../hqnhatSync.service.js';
import { facultyToDepartment } from '../hqnhatMapper.js';
import type { FacultyOptionDto } from '../../../integrations/hqnhat.types.js';
import type { SyncContext, SyncResult } from '../sync.types.js';
import type { SyncEntity } from '../../../models/SyncConfig.js';

// ─── Sync Faculties (Khoa) → Department ─────────────────────────────────────
// Mapping:
//   FacultyOptionDto { id, code, name } → Department { code, name, type=faculty, isActive=true }

const ENTITY: SyncEntity = 'Faculty';

export async function syncFaculties(
  ctx: SyncContext = { triggeredBy: 'cron' }
): Promise<SyncResult> {
  const config = await hqnhatSyncService.getOrCreateConfig(ENTITY);

  // Skip nếu không enabled hoặc mode không phù hợp
  if (!config.enabled) {
    return hqnhatSyncService.skip(ENTITY, config.mode, 'Sync disabled in config');
  }
  if (config.mode === 'DISABLED' || config.mode === 'MASTER') {
    return hqnhatSyncService.skip(ENTITY, config.mode, `Mode=${config.mode} — UMS quản lý`);
  }

  const client = hqnhatSyncService.getClient();
  if (!client) {
    return hqnhatSyncService.runWithGuard(ENTITY, config.mode, async () => {
      throw new Error(
        'HqnhatApiClient not configured. Set HQNHAT_API_URL trong .env.'
      );
    });
  }

  return hqnhatSyncService.runWithGuard(ENTITY, config.mode, async () => {
    // 1) Lấy config handle thật (sau skip checks)
    const liveConfig = config;

    // 2) Pull tất cả faculties từ API
    const faculties = await client.fetchAllPages<FacultyOptionDto>(
      (page, perPage) => client.listFaculties({ page, per_page: perPage }),
      { perPage: 100, maxPages: 50 }
    );

    // 3) Lấy existing mappings
    const existingMappings = await hqnhatSyncService.getAllMappingsForEntity(ENTITY);

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const seenExternalIds = new Set<number>();

    // 4) Iterate từng faculty
    for (const dto of faculties) {
      seenExternalIds.add(dto.id);
      const mapping = existingMappings.get(dto.id);
      const hash = hqnhatSyncService.computeHash(dto);

      if (ctx.dryRun) {
        if (!mapping) created++;
        else if (mapping.hash !== hash) updated++;
        else skipped++;
        continue;
      }

      if (!mapping) {
        // CREATE
        const deptData = facultyToDepartment(dto);
        const dept = await Department.create(deptData);
        await hqnhatSyncService.upsertMapping({
          entity: ENTITY,
          externalId: dto.id,
          umsId: dept._id.toString(),
          hash,
          metadata: { code: dto.code, name: dto.name },
        });
        created++;
      } else if (mapping.hash !== hash) {
        // UPDATE — chỉ update nếu hash thay đổi (delta)
        if (liveConfig.mode === 'READ_ONLY') {
          skipped++;
          continue;
        }
        const deptData = facultyToDepartment(dto);
        await Department.findByIdAndUpdate(mapping.umsId, { $set: deptData });
        await hqnhatSyncService.upsertMapping({
          entity: ENTITY,
          externalId: dto.id,
          umsId: mapping.umsId,
          hash,
          metadata: { code: dto.code, name: dto.name },
        });
        updated++;
      } else {
        // No change
        skipped++;
      }
    }

    // 5) MIRROR mode: xoá các mapping không còn tồn tại ở external
    let deleted = 0;
    if (liveConfig.mode === 'MIRROR' && !ctx.dryRun) {
      for (const [externalId, mapping] of existingMappings) {
        if (!seenExternalIds.has(externalId)) {
          // Soft delete: set isActive=false trên Department
          await Department.findByIdAndUpdate(mapping.umsId, { $set: { isActive: false } });
          await hqnhatSyncService.removeMapping(ENTITY, externalId);
          deleted++;
        }
      }
    }

    return {
      status: 'success' as const,
      total: faculties.length,
      created,
      updated,
      deleted,
      skipped_count: skipped,
      errors: 0,
      message: `Synced ${created} new, ${updated} updated, ${deleted} deactivated, ${skipped} unchanged`,
    };
  });
}