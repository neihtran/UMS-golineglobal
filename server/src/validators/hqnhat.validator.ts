import { z } from 'zod';

// ─── Hqnhat Sync Validators ──────────────────────────────────────────────────

export const syncEntitySchema = z.enum([
  'Faculty',
  'Major',
  'CourseGroup',
  'Course',
  'Curriculum',
  'StudentClass',
  'Student',
]);

export const syncModeSchema = z.enum(['MASTER', 'MIRROR', 'READ_ONLY', 'DISABLED']);

export const triggerSyncSchema = z.object({
  dryRun: z.boolean().optional().default(false),
  forceFullSync: z.boolean().optional().default(false),
});

export const updateSyncConfigSchema = z.object({
  mode: syncModeSchema.optional(),
  enabled: z.boolean().optional(),
  cronExpression: z.string().optional().refine(
    (val) => !val || /^(\S+\s+){4}\S+$/.test(val),
    { message: 'Cron expression không hợp lệ (cần 5 trường)' }
  ),
  conflictStrategy: z.enum(['source_wins', 'ums_wins', 'newest_wins', 'manual_review']).optional(),
  notifyEmails: z.array(z.string().email()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const bulkSyncConfigSchema = z.object({
  configs: z.array(z.object({
    entity: syncEntitySchema,
    mode: syncModeSchema,
    enabled: z.boolean().optional().default(true),
  })).min(1),
});

export type TriggerSyncInput = z.infer<typeof triggerSyncSchema>;
export type UpdateSyncConfigInput = z.infer<typeof updateSyncConfigSchema>;
export type BulkSyncConfigInput = z.infer<typeof bulkSyncConfigSchema>;