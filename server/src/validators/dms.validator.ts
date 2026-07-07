import { z } from 'zod';

// ─── DMS (Văn bản Điện tử) validators ─────────────────────────────────────────

export const idParamSchema = z.object({ id: z.string().min(1, 'ID không hợp lệ') });

export const documentStatusSchema = z.enum([
  'draft', 'pending_review', 'reviewing', 'pending_approval',
  'approved', 'rejected', 'published', 'archived'
]);
export const documentUrgencySchema = z.enum(['normal', 'urgent', 'very_urgent', 'immediate']);
export const documentSecuritySchema = z.enum(['public', 'internal', 'confidential', 'secret']);

export const createDocumentSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  documentNumber: z.string().optional(),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  department: z.string().optional(),
  issuer: z.string().optional(),
  signer: z.string().optional(),
  urgency: documentUrgencySchema.default('normal'),
  security: documentSecuritySchema.default('internal'),
  content: z.string().optional(),
  summary: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  attachmentUrls: z.array(z.string()).optional().default([]),
  dueDate: z.string().optional(),
  parentId: z.string().optional(),
  isExternal: z.boolean().default(false),
  externalUnit: z.string().optional(),
}).strict();

export const updateDocumentSchema = createDocumentSchema.partial().omit({ documentNumber: true }).strict();

export const documentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(15),
  sortBy: z.string().default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  status: documentStatusSchema.optional(),
  categoryId: z.string().optional(),
  department: z.string().optional(),
  urgency: documentUrgencySchema.optional(),
  security: documentSecuritySchema.optional(),
  isExternal: z.coerce.boolean().optional(),
  issuer: z.string().optional(),
  signer: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

// ─── WMS (Quản lý Công việc) validators ────────────────────────────────────────

export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export const taskStatusSchema = z.enum(['todo', 'in_progress', 'review', 'done', 'cancelled']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().optional(),
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  assignee: z.string().optional(),
  assigneeName: z.string().optional(),
  reporter: z.string().optional(),
  reporterName: z.string().optional(),
  priority: taskPrioritySchema.default('medium'),
  status: taskStatusSchema.default('todo'),
  tags: z.array(z.string()).optional().default([]),
  dueDate: z.string().optional(),
  startDate: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().min(0).optional(),
  parentId: z.string().optional(),
}).strict();

export const updateTaskSchema = createTaskSchema.partial().omit({ title: true }).strict();

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  projectId: z.string().optional(),
  assignee: z.string().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Tên dự án không được để trống'),
  description: z.string().optional(),
  manager: z.string().optional(),
  managerName: z.string().optional(),
  department: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).default('active'),
  progress: z.number().min(0).max(100).default(0),
  color: z.string().default('#3b82f6'),
}).strict();

export const updateProjectSchema = createProjectSchema.partial().omit({ name: true }).strict();

export const projectQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  sortBy: z.string().default('startDate'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  status: z.string().optional(),
  department: z.string().optional(),
});

// ─── OCR validators ─────────────────────────────────────────────────────────────

export const ocrStatusSchema = z.enum(['queued', 'processing', 'completed', 'failed', 'cancelled']);

export const createOcrJobSchema = z.object({
  source: z.enum(['upload', 'scan', 'url']),
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
  language: z.string().default('vie'),
  outputFormat: z.enum(['txt', 'pdf', 'docx', 'json']).default('txt'),
  category: z.string().optional(),
  documentId: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
}).strict();

export const updateOcrJobSchema = z.object({
  status: ocrStatusSchema.optional(),
  resultText: z.string().optional(),
  confidence: z.number().min(0).max(100).optional(),
  processingTimeMs: z.number().int().min(0).optional(),
  errorMessage: z.string().optional(),
  outputFormat: z.enum(['txt', 'pdf', 'docx', 'json']).optional(),
}).strict();

export const ocrQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  status: ocrStatusSchema.optional(),
  category: z.string().optional(),
  source: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

// ─── Type exports ──────────────────────────────────────────────────────────────

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type DocumentQueryInput = z.infer<typeof documentQuerySchema>;
export type DocumentStatus = z.infer<typeof documentStatusSchema>;
export type DocumentUrgency = z.infer<typeof documentUrgencySchema>;
export type DocumentSecurity = z.infer<typeof documentSecuritySchema>;

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;

export type CreateOcrJobInput = z.infer<typeof createOcrJobSchema>;
export type OcrQueryInput = z.infer<typeof ocrQuerySchema>;
export type OcrStatus = z.infer<typeof ocrStatusSchema>;
