import { z } from 'zod';

// ─── Document ────────────────────────────────────────────────────────────────
export const createDocumentSchema = z.object({
  code: z.string().min(1, 'Mã văn bản là bắt buộc'),
  title: z.string().min(2, 'Tiêu đề phải có ít nhất 2 ký tự'),
  type: z.string().min(1, 'Loại văn bản là bắt buộc'),
  folder: z.string().optional(),
  content: z.string().optional(),
  fileUrl: z.string().optional(),
  department: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  expiresAt: z.string().optional(),
});

export const updateDocumentSchema = createDocumentSchema.partial().extend({
  status: z.enum(['draft', 'pending', 'approved', 'rejected', 'signed', 'archived']).optional(),
});

export const documentFiltersSchema = z.object({
  page: z.coerce.number().positive().optional(),
  pageSize: z.coerce.number().positive().max(100).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  author: z.string().optional(),
  folder: z.string().optional(),
});

// ─── Document Folder ────────────────────────────────────────────────────────
export const createFolderSchema = z.object({
  name: z.string().min(1, 'Tên thư mục là bắt buộc'),
  parent: z.string().optional(),
  type: z.string().default('general'),
  description: z.string().optional(),
  isPublic: z.boolean().default(true),
});

// ─── Tuition ────────────────────────────────────────────────────────────────
export const createTuitionSchema = z.object({
  student: z.string().min(1, 'Sinh viên là bắt buộc'),
  semester: z.number().int().min(1).max(12),
  academicYear: z.string().min(4),
  amount: z.number().nonnegative(),
  dueDate: z.string().min(1),
  notes: z.string().optional(),
});

export const updateTuitionSchema = createTuitionSchema.partial().extend({
  status: z.enum(['unpaid', 'partial', 'paid', 'exempt', 'deferred']).optional(),
  paidAmount: z.number().nonnegative().optional(),
  paidAt: z.string().optional(),
  paymentMethod: z.string().optional(),
  transactionCode: z.string().optional(),
});

// ─── Expense ──────────────────────────────────────────────────────────────
export const createExpenseSchema = z.object({
  code: z.string().min(1, 'Mã chi phí là bắt buộc'),
  description: z.string().min(2, 'Mô tả là bắt buộc'),
  category: z.string().min(1),
  amount: z.number().nonnegative(),
  date: z.string().min(1),
  vendor: z.string().optional(),
  department: z.string().optional(),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
});

// ─── Budget ───────────────────────────────────────────────────────────────
export const createBudgetSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(2),
  year: z.number().int().min(2000).max(2100),
  department: z.string().optional(),
  totalBudget: z.number().nonnegative(),
  items: z.array(z.object({
    category: z.string(),
    allocated: z.number().nonnegative(),
  })).default([]),
});

// ─── Assignment ───────────────────────────────────────────────────────────
export const createAssignmentSchema = z.object({
  course: z.string().min(1, 'Lớp học phần là bắt buộc'),
  title: z.string().min(2, 'Tiêu đề là bắt buộc'),
  description: z.string().optional(),
  type: z.enum(['individual', 'group', 'quiz', 'project']).default('individual'),
  maxScore: z.number().nonnegative().default(10),
  weight: z.number().nonnegative().default(1),
  dueDate: z.string().min(1),
  openDate: z.string().optional(),
  allowLateSubmission: z.boolean().default(false),
  maxLateDays: z.number().int().nonnegative().optional(),
  attachments: z.array(z.string()).optional(),
  allowResubmit: z.boolean().default(false),
  maxResubmitCount: z.number().int().nonnegative().optional(),
});

export const updateAssignmentSchema = createAssignmentSchema.partial().extend({
  status: z.enum(['draft', 'published', 'closed', 'graded']).optional(),
});

// ─── Submission ────────────────────────────────────────────────────────────
export const createSubmissionSchema = z.object({
  assignment: z.string().min(1),
  content: z.string().optional(),
  fileUrls: z.array(z.string()).optional(),
});

export const gradeSubmissionSchema = z.object({
  score: z.number().min(0).optional(),
  feedback: z.string().optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type CreateTuitionInput = z.infer<typeof createTuitionSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;