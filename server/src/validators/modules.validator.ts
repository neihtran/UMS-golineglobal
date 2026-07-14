import { z } from 'zod';

// ─── Exam ──────────────────────────────────────────────────────────────
export const createExamSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(2),
  course: z.string().optional(),
  semester: z.number().int().min(1).max(12).optional(),
  academicYear: z.string().optional(),
  type: z.enum(['midterm', 'final', 'quiz', 'practical', 'other']),
  duration: z.number().int().min(1).default(90),
  totalScore: z.number().nonnegative().default(10),
  passingScore: z.number().nonnegative().default(5),
  scheduledAt: z.string().optional(),
  room: z.string().optional(),
});
export const updateExamSchema = createExamSchema.partial().extend({
  status: z.enum(['draft', 'scheduled', 'ongoing', 'completed', 'cancelled']).optional(),
});

// ─── Research ────────────────────────────────────────────────────────
export const createResearchSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(2),
  field: z.string().optional(),
  level: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().nonnegative().default(0),
  leader: z.string().min(1),
  members: z.array(z.string()).default([]),
});
export const updateResearchSchema = createResearchSchema.partial().extend({
  status: z.enum(['proposal', 'approved', 'ongoing', 'completed', 'cancelled']).optional(),
});

// ─── KPI ──────────────────────────────────────────────────────────────
export const createKpiSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(2),
  module: z.string().optional(),
  target: z.number().nonnegative().default(0),
  unit: z.string().default('count'),
  period: z.enum(['monthly', 'quarterly', 'yearly']),
  year: z.number().int().min(2000),
});
export const updateKpiSchema = createKpiSchema.partial().extend({
  status: z.enum(['active', 'achieved', 'failed']).optional(),
});

// ─── KTX Room ────────────────────────────────────────────────────────
export const createKtxRoomSchema = z.object({
  code: z.string().min(1),
  building: z.string().min(1),
  floor: z.number().int().min(1),
  type: z.enum(['male', 'female', 'mixed']),
  capacity: z.number().int().min(1).default(6),
  pricePerMonth: z.number().nonnegative().default(0),
  facilities: z.array(z.string()).default([]),
});
export const updateKtxRoomSchema = createKtxRoomSchema.partial().extend({
  status: z.enum(['available', 'full', 'maintenance', 'closed']).optional(),
});

// ─── QA Evidence ─────────────────────────────────────────────────────
export const createQaEvidenceSchema = z.object({
  standard: z.string().min(1),
  criteria: z.string().min(1),
  title: z.string().min(2),
  description: z.string().optional(),
  fileUrls: z.array(z.string()).default([]),
});
export const updateQaEvidenceSchema = createQaEvidenceSchema.partial().extend({
  status: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional(),
});

// ─── WMS Task ───────────────────────────────────────────────────────
export const createWmsTaskSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(2),
  description: z.string().optional(),
  project: z.string().optional(),
  assignee: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  dueDate: z.string().optional(),
});
export const updateWmsTaskSchema = createWmsTaskSchema.partial().extend({
  status: z.enum(['todo', 'in_progress', 'review', 'done', 'cancelled']).optional(),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type CreateResearchInput = z.infer<typeof createResearchSchema>;
export type CreateKpiInput = z.infer<typeof createKpiSchema>;
export type CreateKtxRoomInput = z.infer<typeof createKtxRoomSchema>;
export type CreateQaEvidenceInput = z.infer<typeof createQaEvidenceSchema>;
export type CreateWmsTaskInput = z.infer<typeof createWmsTaskSchema>;