/**
 * Hqnhat Alerting Service
 *
 * Quản lý alerts khi sync fail liên tiếp:
 *   1. Track consecutive failures per entity
 *   2. Gửi alert khi vượt ngưỡng HQNHAT_ALERT_ON_CONSECUTIVE_FAILURES
 *   3. Hỗ trợ email alerts (nodemailer) + Slack webhook (optional)
 *   4. Ghi alert vào IntegrationLog để audit
 *
 * Cấu hình (env):
 *   HQNHAT_ALERT_ON_CONSECUTIVE_FAILURES=3  (default: 3)
 *   HQNHAT_ALERT_EMAIL=admin@uni.edu,ops@uni.edu
 *   SLACK_WEBHOOK_URL=https://hooks.slack.com/... (optional)
 */

import { IntegrationLog } from '../../models/index.js';
import { HQNHAT_ALERT_CONSECUTIVE_FAILURES, HQNHAT_ALERT_EMAIL } from '../../config/env.js';
import type { SyncEntity } from '../../models/SyncConfig.js';

// ─── In-memory failure tracking ────────────────────────────────────────────────
// Key: "source:entity" → consecutive failure count
// Reset khi sync thành công
const consecutiveFailures = new Map<string, number>();

const ENTITY_LABELS: Record<string, string> = {
  Faculty: 'Khoa',
  Major: 'Ngành',
  Course: 'Học phần',
  Curriculum: 'Chương trình đào tạo',
  StudentClass: 'Lớp sinh viên',
  Student: 'Sinh viên',
  CourseGroup: 'Nhóm học phần',
};

// ─── Record a failure ─────────────────────────────────────────────────────────
export async function recordSyncFailure(
  source: string,
  entity: SyncEntity,
  errorMessage: string,
  metadata?: Record<string, unknown>
): Promise<boolean> {
  const key = `${source}:${entity}`;
  const count = (consecutiveFailures.get(key) ?? 0) + 1;
  consecutiveFailures.set(key, count);

  if (count >= HQNHAT_ALERT_CONSECUTIVE_FAILURES) {
    await sendAlert(source, entity, count, errorMessage, metadata);
    return true; // Alert sent
  }

  return false;
}

// ─── Record a success ─────────────────────────────────────────────────────────
export function recordSyncSuccess(source: string, entity: SyncEntity): void {
  const key = `${source}:${entity}`;
  consecutiveFailures.delete(key);
}

// ─── Get current failure count ────────────────────────────────────────────────
export function getFailureCount(source: string, entity: SyncEntity): number {
  return consecutiveFailures.get(`${source}:${entity}`) ?? 0;
}

// ─── Reset failure count ──────────────────────────────────────────────────────
export function resetFailureCount(source: string, entity: SyncEntity): void {
  consecutiveFailures.delete(`${source}:${entity}`);
}

// ─── Send alert ───────────────────────────────────────────────────────────────
async function sendAlert(
  source: string,
  entity: SyncEntity,
  consecutiveCount: number,
  errorMessage: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const timestamp = new Date().toLocaleString('vi-VN');
  const entityLabel = ENTITY_LABELS[entity] ?? entity;

  // ─── 1. Log to IntegrationLog ────────────────────────────────────────────
  try {
    await IntegrationLog.create({
      source,
      event: 'SYNC_ALERT_SENT',
      entity,
      status: 'alert',
      metadata: {
        type: 'consecutive_failure_alert',
        consecutiveCount,
        threshold: HQNHAT_ALERT_CONSECUTIVE_FAILURES,
        errorMessage,
        alertEmails: HQNHAT_ALERT_EMAIL,
        ...metadata,
      },
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('[HqnhatAlert] Failed to log alert to IntegrationLog:', err);
  }

  // ─── 2. Console output (always) ─────────────────────────────────────────
  console.warn(
    `\n⚠️  [HQNHAT ALERT] Sync ${entityLabel} failed ${consecutiveCount} consecutive times\n` +
    `    Last error: ${errorMessage}\n` +
    `    Time: ${timestamp}\n` +
    `    Emails: ${HQNHAT_ALERT_EMAIL.join(', ') || 'none configured'}`
  );

  // ─── 3. Send email alerts ────────────────────────────────────────────────
  if (HQNHAT_ALERT_EMAIL.length > 0) {
    await sendEmailAlert(source, entity, consecutiveCount, errorMessage, timestamp);
  }

  // ─── 4. Slack webhook (if configured) ──────────────────────────────────
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  if (slackUrl) {
    await sendSlackAlert(source, entity, consecutiveCount, errorMessage, timestamp);
  }
}

// ─── Email alert ───────────────────────────────────────────────────────────────
async function sendEmailAlert(
  _source: string,
  entity: SyncEntity,
  consecutiveCount: number,
  errorMessage: string,
  timestamp: string
): Promise<void> {
  const entityLabel = ENTITY_LABELS[entity] ?? entity;
  const subject = `[UMS Alert] Hqnhat Sync ${entityLabel} failed ${consecutiveCount}x`;
  const body = `
UMS Hqnhat Integration Alert
===========================
Source: api.hqnhat.id.vn
Entity: ${entityLabel} (${entity})
Consecutive Failures: ${consecutiveCount}
Last Error: ${errorMessage}
Time: ${timestamp}

Action Required:
- Check if api.hqnhat.id.vn is responding
- Check MongoDB connectivity
- Review IntegrationLog for details: /api/int/hqnhat/logs?entity=${entity}

This is an automated alert from UMS.
  `.trim();

  // Note: In production, integrate with nodemailer or a mail service like SendGrid.
  // Here we log the email that would be sent.
  for (const email of HQNHAT_ALERT_EMAIL) {
    console.log(`[HqnhatAlert] Would send email to: ${email}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body preview: ${body.substring(0, 100)}...`);

    // TODO: Uncomment when nodemailer is configured
    // try {
    //   await sendEmail({ to: email, subject, text: body });
    // } catch (err) {
    //   console.error(`[HqnhatAlert] Email send failed to ${email}:`, err);
    // }
  }
}

// ─── Slack alert ───────────────────────────────────────────────────────────────
async function sendSlackAlert(
  _source: string,
  entity: SyncEntity,
  consecutiveCount: number,
  errorMessage: string,
  timestamp: string
): Promise<void> {
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  if (!slackUrl) return;

  const entityLabel = ENTITY_LABELS[entity] ?? entity;

  const payload = {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `⚠️ UMS Hqnhat Sync Alert`, emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Entity:*\n${entityLabel}` },
          { type: 'mrkdwn', text: `*Consecutive Failures:*\n${consecutiveCount}` },
          { type: 'mrkdwn', text: `*Time:*\n${timestamp}` },
          { type: 'mrkdwn', text: `*Last Error:*\n\`\`\`${errorMessage.substring(0, 200)}\`\`\`` },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View Integration Logs' },
            url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/int/hqnhat-sync`,
            action_id: 'view_sync_logs',
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(slackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`[HqnhatAlert] Slack webhook failed: ${res.status} ${res.statusText}`);
    }
  } catch (err) {
    console.error('[HqnhatAlert] Slack webhook error:', err);
  }
}

// ─── Check if alert was already sent for this failure window ─────────────────
// Prevents duplicate alerts for the same failure streak
const alertedEntities = new Set<string>();

export function hasAlertedRecently(source: string, entity: SyncEntity): boolean {
  return alertedEntities.has(`${source}:${entity}`);
}

export function markAlertSent(source: string, entity: SyncEntity): void {
  alertedEntities.add(`${source}:${entity}`);
  // Auto-clear after 1 hour to allow new alerts
  setTimeout(() => {
    alertedEntities.delete(`${source}:${entity}`);
  }, 60 * 60 * 1000);
}
