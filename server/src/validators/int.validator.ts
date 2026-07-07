import { z } from 'zod';

// ─── INT (Tích hợp) validators ──────────────────────────────────────────────

export const integrationStatusSchema = z.enum(['active', 'inactive', 'error']);
export const integrationDirectionSchema = z.enum(['push', 'pull', 'bidirectional']);

export const createIntegrationSchema = z.object({
  name: z.string().min(1, 'Tên tích hợp không được để trống'),
  system: z.string().min(1, 'Hệ thống không được để trống'),
  direction: integrationDirectionSchema,
  endpoint: z.string().url('Endpoint phải là URL hợp lệ'),
  apiKey: z.string().optional(),
  status: integrationStatusSchema.default('inactive'),
  syncIntervalMinutes: z.number().int().positive().optional(),
  retryPolicy: z.object({
    maxRetries: z.number().int().min(0).default(3),
    backoffMs: z.number().int().positive().default(5000),
  }).optional(),
  config: z.record(z.unknown()).optional().default({}),
}).strict();

export const updateIntegrationSchema = z.object({
  name: z.string().min(1).optional(),
  system: z.string().optional(),
  direction: integrationDirectionSchema.optional(),
  endpoint: z.string().url().optional(),
  status: integrationStatusSchema.optional(),
  syncIntervalMinutes: z.number().int().positive().optional(),
  retryPolicy: z.object({
    maxRetries: z.number().int().min(0),
    backoffMs: z.number().int().positive(),
  }).optional(),
  config: z.record(z.unknown()).optional(),
}).strict();

export const integrationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('name'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),
  system: z.string().optional(),
  status: integrationStatusSchema.optional(),
});

export const integrationLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  integrationId: z.string().optional(),
  status: z.enum(['success', 'error']).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

// ─── Type exports ──────────────────────────────────────────────────────────────

export type CreateIntegrationInput = z.infer<typeof createIntegrationSchema>;
export type UpdateIntegrationInput = z.infer<typeof updateIntegrationSchema>;
export type IntegrationQueryInput = z.infer<typeof integrationQuerySchema>;
export type IntegrationLogQueryInput = z.infer<typeof integrationLogQuerySchema>;
export type IntegrationStatus = z.infer<typeof integrationStatusSchema>;
export type IntegrationDirection = z.infer<typeof integrationDirectionSchema>;
