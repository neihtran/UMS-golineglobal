// @ts-nocheck
import {
  ExternalMapping,
  SyncConfig,
  IntegrationLog,
  type ISyncConfig,
  type SyncEntity,
  type SyncMode,
} from '../../models/index.js';
import { env } from '../../config/env.js';
import { HqnhatApiClient } from '../../integrations/hqnhat.js';
import { payloadHash } from './hqnhatMapper.js';
import {
  DEFAULT_SYNC_MODES,
  ENTITY_TO_UMS_MODEL,
  type SyncResult,
} from './sync.types.js';

// ─── HqnhatSyncService ───────────────────────────────────────────────────────
// Orchestrator cho mọi sync job giữa api.hqnhat.id.vn ↔ UMS.
// Cung cấp:
//   - getOrCreateConfig(): lấy hoặc tạo SyncConfig cho entity
//   - logSyncRun(): ghi log + cập nhật lastRunAt
//   - getClient(): tạo HqnhatApiClient (lazy, theo env)
//   - processMappings(): xử lý từng DTO — insert/update theo mode
//   - helper: deleteMissingInMirrorMode()

export class HqnhatSyncService {
  private client: HqnhatApiClient | null = null;
  private readonly source = 'hqnhat';

  /**
   * Lấy hoặc tạo SyncConfig cho 1 entity. Có thể override mode qua `override`.
   */
  async getOrCreateConfig(
    entity: SyncEntity,
    override?: Partial<Pick<ISyncConfig, 'mode' | 'enabled' | 'cronExpression'>>
  ): Promise<ISyncConfig> {
    const existing = await SyncConfig.findOne({ source: this.source, entity });
    if (existing) {
      if (override) {
        Object.assign(existing, override);
        await existing.save();
      }
      return existing;
    }

    const defaultMode = DEFAULT_SYNC_MODES[entity] ?? 'MASTER';
    return SyncConfig.create({
      source: this.source,
      entity,
      mode: override?.mode ?? defaultMode,
      enabled: override?.enabled ?? true,
      cronExpression: override?.cronExpression,
      conflictStrategy: 'source_wins',
    });
  }

  /**
   * Tạo HqnhatApiClient (lazy init). Trả về null nếu chưa có baseUrl.
   * Cho phép gọi API không cần auth (API public).
   */
  getClient(): HqnhatApiClient | null {
    if (this.client) return this.client;

    const baseUrl = env.HQNHAT_API_URL;
    if (!baseUrl) return null;

    const token = env.HQNHAT_API_TOKEN || undefined;
    const username = env.HQNHAT_API_USERNAME || undefined;
    const password = env.HQNHAT_API_PASSWORD || undefined;

    this.client = new HqnhatApiClient({
      baseUrl,
      token,
      username,
      password,
      timeoutMs: parseInt(env.HQNHAT_API_TIMEOUT_MS, 10),
      retryMax: parseInt(env.HQNHAT_API_RETRY_MAX, 10),
    });

    return this.client;
  }

  /**
   * Ping API để check kết nối. Trả về { ok, error? }
   */
  async healthCheck(): Promise<{ ok: boolean; error?: string; latencyMs?: number }> {
    const client = this.getClient();
    if (!client) {
      return { ok: false, error: 'HqnhatApiClient not configured' };
    }
    const t0 = Date.now();
    try {
      const ok = await client.ping({ logToIntegration: false });
      return { ok, latencyMs: Date.now() - t0 };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        latencyMs: Date.now() - t0,
      };
    }
  }

  /**
   * Tìm UMS ObjectId từ external ID (cached).
   */
  async findUmsIdByExternalId(
    entity: SyncEntity,
    externalId: number
  ): Promise<{ umsId: string; umsModel: string; hash?: string } | null> {
    const mapping = await ExternalMapping.findOne({
      source: this.source,
      entity,
      externalId,
    }).lean();
    if (!mapping) return null;
    return {
      umsId: mapping.umsId.toString(),
      umsModel: mapping.umsModel,
      hash: mapping.externalHash,
    };
  }

  /**
   * Lấy toàn bộ mapping cho entity (dùng để diff).
   */
  async getAllMappingsForEntity(
    entity: SyncEntity
  ): Promise<Map<number, { umsId: string; hash?: string; metadata?: Record<string, unknown> }>> {
    const mappings = await ExternalMapping.find({
      source: this.source,
      entity,
    }).lean();

    const map = new Map<number, { umsId: string; hash?: string; metadata?: Record<string, unknown> }>();
    for (const m of mappings) {
      map.set(m.externalId, {
        umsId: m.umsId.toString(),
        hash: m.externalHash,
        metadata: m.metadata,
      });
    }
    return map;
  }

  /**
   * Cập nhật hoặc tạo mới mapping. Idempotent.
   */
  async upsertMapping(params: {
    entity: SyncEntity;
    externalId: number;
    umsId: string;
    hash: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const { entity, externalId, umsId, hash, metadata } = params;
    const umsModel = ENTITY_TO_UMS_MODEL[entity];

    await ExternalMapping.findOneAndUpdate(
      { source: this.source, entity, externalId },
      {
        $set: {
          umsId,
          umsModel,
          externalHash: hash,
          metadata: metadata ?? {},
          lastSyncedAt: new Date(),
        },
        $setOnInsert: { source: this.source, entity, externalId },
      },
      { upsert: true, new: true }
    );
  }

  /**
   * Ghi log sync run + cập nhật SyncConfig.
   */
  async logSyncRun(result: SyncResult): Promise<void> {
    // 1) Cập nhật SyncConfig
    await SyncConfig.findOneAndUpdate(
      { source: this.source, entity: result.entity },
      {
        $set: {
          lastRunAt: result.completedAt,
          lastRunStatus: result.status,
          lastRunMessage: result.error ?? result.message,
        },
      }
    );

    // 2) Ghi IntegrationLog (audit trail)
    if (result.status === 'failed') {
      await IntegrationLog.create({
        source: this.source,
        event: `SYNC_${result.entity.toUpperCase()}_FAILED`,
        payload: {
          mode: result.mode,
          created: result.created ?? 0,
          updated: result.updated ?? 0,
          deleted: result.deleted ?? 0,
          durationMs: result.durationMs,
        },
        status: 'failed',
        error: result.error,
        timestamp: result.completedAt,
      });
    } else if (result.status === 'success') {
      await IntegrationLog.create({
        source: this.source,
        event: `SYNC_${result.entity.toUpperCase()}_SUCCESS`,
        payload: {
          mode: result.mode,
          created: result.created ?? 0,
          updated: result.updated ?? 0,
          deleted: result.deleted ?? 0,
          durationMs: result.durationMs,
        },
        status: 'success',
        timestamp: result.completedAt,
      });
    }
    // 'skipped' → không log để giảm noise
  }

  /**
   * Helper: chạy 1 sync job với error handling + log tự động.
   */
  async runWithGuard(
    entity: SyncEntity,
    mode: SyncMode,
    job: () => Promise<Omit<SyncResult, 'entity' | 'source' | 'mode' | 'startedAt' | 'completedAt' | 'durationMs' | 'status'>>
  ): Promise<SyncResult> {
    const startedAt = new Date();
    const t0 = Date.now();
    try {
      const partial = await job();
      const completedAt = new Date();
      const result: SyncResult = {
        ...partial,
        entity,
        source: this.source,
        mode,
        status: 'success',
        startedAt,
        completedAt,
        durationMs: Date.now() - t0,
      };
      await this.logSyncRun(result);

      // Record success for alerting (reset consecutive failure count)
      try {
        const { recordSyncSuccess } = await import('./hqnhatAlert.service.js');
        recordSyncSuccess(this.source, entity);
      } catch (_) { /* non-critical */ }

      return result;
    } catch (err) {
      const completedAt = new Date();
      const errorMessage = err instanceof Error ? err.message : String(err);
      const result: SyncResult = {
        entity,
        source: this.source,
        mode,
        status: 'failed',
        startedAt,
        completedAt,
        durationMs: Date.now() - t0,
        error: errorMessage,
      };
      await this.logSyncRun(result);
      console.error(`[HqnhatSync] ${entity} failed:`, err);

      // Record failure for alerting (triggers alert after consecutive failures)
      try {
        const { recordSyncFailure } = await import('./hqnhatAlert.service.js');
        const errorObj = err instanceof Error ? err : new Error(errorMessage);
        await recordSyncFailure(this.source, entity, errorObj.message, {
          mode,
          durationMs: result.durationMs,
        });
      } catch (_) { /* non-critical */ }

      // Record failure for retry queue (skip if already a retry attempt)
      if (err instanceof Error) {
        try {
          const { recordFailure } = await import('./retryQueue.js');
          await recordFailure({
            source: this.source,
            entity,
            error: err,
            payload: { mode, durationMs: result.durationMs },
          });
        } catch (recordErr) {
          console.error('[HqnhatSync] Failed to record failure:', recordErr);
        }
      }

      return result;
    }
  }

  /**
   * Helper: skip sync cho 1 entity (ghi log "skipped").
   * Dùng khi mode = MASTER / DISABLED.
   */
  async skip(
    entity: SyncEntity,
    mode: SyncMode,
    reason: string
  ): Promise<SyncResult> {
    const now = new Date();
    const result: SyncResult = {
      entity,
      source: this.source,
      mode,
      status: 'skipped',
      startedAt: now,
      completedAt: now,
      durationMs: 0,
      message: reason,
    };
    await this.logSyncRun(result);
    return result;
  }

  /**
   * Xoá mapping khi entity không còn tồn tại ở external.
   * Dùng trong MIRROR mode để đồng bộ 2 chiều.
   */
  async removeMapping(entity: SyncEntity, externalId: number): Promise<void> {
    await ExternalMapping.deleteOne({
      source: this.source,
      entity,
      externalId,
    });
  }

  /**
   * Tính hash của payload DTO (dùng cho delta detection).
   * Re-export từ mapper cho tiện.
   */
  computeHash(payload: unknown): string {
    return payloadHash(payload);
  }
}

export const hqnhatSyncService = new HqnhatSyncService();