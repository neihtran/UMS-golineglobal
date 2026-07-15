/**
 * Webhook Routes — api.hqnhat.id.vn Outbound Webhooks
 *
 * Hqnhat API có thể gửi webhook events về UMS khi có thay đổi data phía source.
 * Hiện tại Laravel API của hqnhat có thể không support webhooks, nhưng
 * endpoint này được thiết kế để:
 *   1. Nhận webhook từ hqnhat (khi API có hỗ trợ)
 *   2. Validate signature (HMAC-SHA256)
 *   3. Trigger delta sync cho entity tương ứng
 *   4. Acknowledge với HTTP 200 nhanh (queue async processing)
 *
 * Nếu API không support webhook, UMS vẫn dùng cron-based sync như plan.
 *
 * Ref: docs/external-api.md — kiểm tra xem hqnhat có webhook documentation không
 */

import { Router } from 'express';
import crypto from 'crypto';
import { IntegrationLog } from '../models/index.js';
import {
  syncFaculties,
  syncMajors,
  syncCourses,
  syncCurriculums,
  syncStudentClasses,
  syncStudents,
} from '../services/integration/jobs/index.js';

const router = Router();

// ─── Env config (lazy load để tránh circular dependency) ─────────────────────
function getWebhookSecret(): string {
  // HQNHAT_WEBHOOK_SECRET từ env — cần set khi hqnhat API support webhook
  return process.env.HQNHAT_WEBHOOK_SECRET || '';
}

function getWebhookSecretFromHeader(header: string | undefined): string {
  if (!header) return '';
  // Format: "sha256=<hash>"
  return header.replace(/^sha256=/, '');
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  if (!secret) return true; // Skip verify nếu chưa có secret
  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    // Invalid signature format or comparison failed
    return false;
  }
}

// ─── Webhook event types ──────────────────────────────────────────────────────
type HqnhatWebhookEvent =
  | 'entity.created'
  | 'entity.updated'
  | 'entity.deleted'
  | 'sync.requested';

interface WebhookPayload {
  event: HqnhatWebhookEvent;
  entity: string;
  timestamp: string;
  /** External ID của record vừa thay đổi */
  externalId?: number;
}

const ENTITY_TO_SYNC_JOB: Record<string, () => Promise<unknown>> = {
  faculties: syncFaculties,
  majors: syncMajors,
  courses: syncCourses,
  curriculums: syncCurriculums,
  student_classes: syncStudentClasses,
  students: syncStudents,
};

// ─── POST /webhooks/hqnhat — Main webhook endpoint ──────────────────────────
router.post('/hqnhat', async (req, res) => {
  // 1. Acknowledge ngay lập tức (best practice cho webhook)
  res.status(200).json({ received: true, queued: true });

  // 2. Lấy raw body cho signature verification
  // Note: Express cần raw body buffer cho verify → đã setup ở app.ts
  const rawBody: Buffer | undefined = (req as any).rawBody;
  const signature = getWebhookSecretFromHeader(req.headers['x-hqnhat-signature'] as string | undefined);
  const secret = getWebhookSecret();

  // 3. Verify signature (nếu có secret)
  if (secret && !verifySignature(rawBody ? rawBody.toString('utf8') : JSON.stringify(req.body), signature, secret)) {
    console.warn('[Webhook] Invalid signature from hqnhat — rejecting');
    await logWebhookEvent('WEBHOOK_REJECTED', 'invalid_signature', 'unknown', {
      ip: req.ip,
      headers: req.headers,
    });
    return; // Response đã gửi ở trên
  }

  // 4. Parse payload
  let payload: WebhookPayload;
  try {
    payload = req.body as WebhookPayload;
    if (!payload.event || !payload.entity) {
      throw new Error('Missing event or entity');
    }
  } catch (err) {
    console.error('[Webhook] Invalid payload:', err);
    await logWebhookEvent('WEBHOOK_INVALID_PAYLOAD', 'parse_error', 'unknown', {
      error: String(err),
    });
    return;
  }

  // 5. Log webhook received
  await logWebhookEvent('WEBHOOK_RECEIVED', payload.event as string, payload.entity as string, {
    externalId: payload.externalId,
    timestamp: payload.timestamp,
  });

  // 6. Process event asynchronously
  processWebhookEvent(payload).catch((err) => {
    console.error('[Webhook] Processing error:', err);
  });
});

// ─── POST /webhooks/hqnhat/test — Test webhook endpoint ─────────────────────
router.post('/hqnhat/test', async (req, res) => {
  const { event = 'entity.updated', entity = 'faculties', externalId } = req.body as Partial<WebhookPayload>;

  const testPayload: WebhookPayload = {
    event: event as HqnhatWebhookEvent,
    entity,
    timestamp: new Date().toISOString(),
    externalId,
  };

  console.log('[Webhook] Test received:', testPayload);

  try {
    await processWebhookEvent(testPayload);
    res.json({ success: true, processed: true });
  } catch (err) {
    console.error('[Webhook] Test processing error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─── GET /webhooks/hqnhat/status — Check webhook config ──────────────────────
router.get('/hqnhat/status', (_req, res) => {
  const secret = getWebhookSecret();
  res.json({
    webhookConfigured: !!secret,
    endpoint: '/api/webhooks/hqnhat',
    supportedEvents: [
      'entity.created',
      'entity.updated',
      'entity.deleted',
      'sync.requested',
    ],
    supportedEntities: Object.keys(ENTITY_TO_SYNC_JOB),
    note: secret
      ? 'Webhook signature verification ENABLED'
      : 'Webhook signature verification DISABLED (set HQNHAT_WEBHOOK_SECRET to enable)',
  });
});

// ─── Helper: Process webhook event ───────────────────────────────────────────
async function processWebhookEvent(payload: WebhookPayload): Promise<void> {
  const { event, entity, externalId } = payload;

  console.log(`[Webhook] Processing: ${event} on ${entity} (id=${externalId})`);

  const syncJob = ENTITY_TO_SYNC_JOB[entity.toLowerCase()];

  if (!syncJob) {
    console.warn(`[Webhook] Unknown entity: ${entity}`);
    await logWebhookEvent('WEBHOOK_ENTITY_UNKNOWN', event, entity, { externalId });
    return;
  }

  const ctx = {
    triggeredBy: 'webhook' as const,
    dryRun: false,
    forceFullSync: false,
    webhookPayload: payload,
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void ctx; // Used for context tracking in future per-record sync

  try {
    switch (event) {
      case 'entity.created':
      case 'entity.updated': {
        // Delta sync: chỉ sync record có externalId
        if (externalId) {
          // Với webhook, ta trigger full sync nhưng có thể filter theo externalId
          // Hiện tại sync service chưa support per-record sync
          // → fallback về full sync
          await logWebhookEvent('WEBHOOK_DELTA_SYNC_START', event, entity, { externalId });
        }

        const result = await syncJob();
        await logWebhookEvent(
          'WEBHOOK_SYNC_COMPLETED',
          event,
          entity,
          {
            externalId,
            syncResult: {
              status: (result as any)?.status,
              created: (result as any)?.created,
              updated: (result as any)?.updated,
            },
          }
        );
        break;
      }

      case 'entity.deleted': {
        // Xử lý delete: cần soft delete hoặc mark as deleted trong UMS
        // Hiện tại chưa implement hard/soft delete logic
        await logWebhookEvent('WEBHOOK_DELETE_RECEIVED', event, entity, {
          externalId,
          note: 'Delete handling not yet implemented — manual review required',
        });
        break;
      }

      case 'sync.requested': {
        // Hqnhat backend yêu cầu sync ngay
        console.log(`[Webhook] Sync requested for ${entity}`);
        await syncJob();
        await logWebhookEvent('WEBHOOK_SYNC_ON_DEMAND', event, entity, {});
        break;
      }

      default:
        console.warn(`[Webhook] Unknown event type: ${event}`);
        await logWebhookEvent('WEBHOOK_UNKNOWN_EVENT', event, entity, {});
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Webhook] Error processing ${event} on ${entity}:`, err);

    await logWebhookEvent('WEBHOOK_SYNC_FAILED', event, entity, {
      externalId,
      error: errorMsg,
    });
  }
}

// ─── Helper: Log webhook event to IntegrationLog ─────────────────────────────
async function logWebhookEvent(
  event: string,
  trigger: string,
  entity: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await IntegrationLog.create({
      source: 'hqnhat',
      event,
      entity: entity || undefined,
      status: 'webhook',
      metadata: {
        trigger,
        ...metadata,
      },
      timestamp: new Date(),
    });
  } catch (err) {
    // Non-fatal: don't crash webhook processing
    console.error('[Webhook] Failed to write IntegrationLog:', err);
  }
}

export default router;
