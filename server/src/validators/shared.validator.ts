import { z } from 'zod';

// ─── Shared schemas ──────────────────────────────────────────────────────────────
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID không hợp lệ'),
});

// ─── BI (Phân tích Dữ liệu) validators ────────────────────────────────────────

export const reportTypeSchema = z.enum(['enrollment', 'staff', 'finance', 'graduation', 'research', 'library', 'custom']);
export const reportFormatSchema = z.enum(['json', 'csv', 'pdf', 'xlsx']);

export const createReportSchema = z.object({
  name: z.string().min(1, 'Tên báo cáo không được để trống'),
  description: z.string().optional(),
  type: reportTypeSchema,
  module: z.string().optional(),
  params: z.record(z.unknown()).optional().default({}),
  format: reportFormatSchema.default('json'),
  isPublic: z.boolean().default(false),
  schedule: z.enum(['on_demand', 'daily', 'weekly', 'monthly', 'semester']).default('on_demand'),
}).strict();

export const updateReportSchema = createReportSchema.partial().omit({}).strict();

export const reportQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  type: reportTypeSchema.optional(),
  module: z.string().optional(),
  schedule: z.string().optional(),
  isPublic: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// ─── QA (Kiểm định Chất lượng) validators ──────────────────────────────────────

export const standardCodeSchema = z.enum(['AUN_1', 'AUN_2', 'AUN_3', 'AUN_4', 'AUN_5', 'AUN_6', 'AUN_7', 'AUN_8']);
export const evidenceStatusSchema = z.enum(['draft', 'submitted', 'reviewing', 'approved', 'rejected', 'archived']);
export const assessmentTypeSchema = z.enum(['internal', 'external', 'self_assessment']);

export const createEvidenceSchema = z.object({
  title: z.string().min(1, 'Tiêu đề minh chứng không được để trống'),
  description: z.string().optional(),
  standardCode: standardCodeSchema,
  criteria: z.array(z.string()).optional().default([]),
  documentUrls: z.array(z.string()).optional().default([]),
  status: evidenceStatusSchema.default('draft'),
  submittedBy: z.string().optional(),
  submittedAt: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewComment: z.string().optional(),
}).strict();

export const updateEvidenceSchema = createEvidenceSchema.partial().omit({}).strict();

export const evidenceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  standardCode: standardCodeSchema.optional(),
  status: evidenceStatusSchema.optional(),
  submittedBy: z.string().optional(),
  reviewedBy: z.string().optional(),
  search: z.string().optional(),
});

export const createAssessmentSchema = z.object({
  title: z.string().min(1),
  type: assessmentTypeSchema,
  standardCode: standardCodeSchema,
  assessors: z.array(z.string()).optional().default([]),
  targetDepartment: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  status: z.enum(['planning', 'active', 'completed', 'archived']).default('planning'),
  criteria: z.array(z.object({
    code: z.string(),
    description: z.string(),
    weight: z.number().min(0).max(100),
  })).optional().default([]),
  note: z.string().optional(),
}).strict();

export const assessmentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('startDate'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  type: assessmentTypeSchema.optional(),
  standardCode: standardCodeSchema.optional(),
  status: z.string().optional(),
  targetDepartment: z.string().optional(),
});

// ─── DCE (Năng lực Số) validators ──────────────────────────────────────────────

export const competencyCategorySchema = z.enum(['digital_competence', 'teaching_competence', 'research_competence', 'leadership_competence']);
export const competencyLevelSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

export const createCompetencySchema = z.object({
  name: z.string().min(1, 'Tên năng lực không được để trống'),
  category: competencyCategorySchema,
  description: z.string().optional(),
  indicators: z.array(z.string()).optional().default([]),
  levels: z.array(z.object({
    level: competencyLevelSchema,
    description: z.string(),
  })).optional().default([]),
  isActive: z.boolean().default(true),
}).strict();

export const updateCompetencySchema = createCompetencySchema.partial().omit({}).strict();

export const competencyQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('name'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
  category: competencyCategorySchema.optional(),
  level: competencyLevelSchema.optional(),
  isActive: z.coerce.boolean().optional(),
});

export const createCompetencyAssessmentSchema = z.object({
  personId: z.string().min(1),
  personName: z.string().optional(),
  competencyId: z.string().min(1),
  assessor: z.string().optional(),
  selfLevel: competencyLevelSchema.optional(),
  assessedLevel: competencyLevelSchema.optional(),
  score: z.number().min(0).max(10).optional(),
  comment: z.string().optional(),
  evidenceUrls: z.array(z.string()).optional().default([]),
  assessedAt: z.string().optional(),
}).strict();

export const competencyAssessmentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  personId: z.string().optional(),
  competencyId: z.string().optional(),
  minScore: z.coerce.number().min(0).max(10).optional(),
  maxScore: z.coerce.number().min(0).max(10).optional(),
});

// ─── LIB (Thư viện) validators ─────────────────────────────────────────────────

export const bookCategorySchema = z.enum(['textbook', 'reference', 'novel', 'journal', 'thesis', 'magazine', 'other']);

export const createBookSchema = z.object({
  isbn: z.string().optional(),
  title: z.string().min(1, 'Tên sách không được để trống'),
  authors: z.array(z.string()).optional().default([]),
  publisher: z.string().optional(),
  publishYear: z.number().int().min(1000).max(2100).optional(),
  category: bookCategorySchema.default('other'),
  department: z.string().optional(),
  totalCopies: z.number().int().min(0).default(1),
  availableCopies: z.number().int().min(0).default(1),
  location: z.string().optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  language: z.string().default('vi'),
  pages: z.number().int().min(1).optional(),
  tags: z.array(z.string()).optional().default([]),
}).strict();

export const updateBookSchema = createBookSchema.partial().omit({ isbn: true }).strict();

export const bookQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  category: bookCategorySchema.optional(),
  department: z.string().optional(),
  author: z.string().optional(),
  publisher: z.string().optional(),
  minYear: z.coerce.number().int().optional(),
  maxYear: z.coerce.number().int().optional(),
});

export const createBorrowRecordSchema = z.object({
  bookId: z.string().min(1),
  bookTitle: z.string().optional(),
  borrowerId: z.string().min(1),
  borrowerName: z.string().optional(),
  borrowerType: z.enum(['student', 'staff', 'external']).default('student'),
  borrowDate: z.string().min(1),
  dueDate: z.string().min(1),
  returnDate: z.string().optional(),
  status: z.enum(['borrowed', 'returned', 'overdue', 'lost']).default('borrowed'),
  fine: z.number().min(0).default(0),
  note: z.string().optional(),
}).strict();

export const borrowRecordQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('borrowDate'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  bookId: z.string().optional(),
  borrowerId: z.string().optional(),
  status: z.string().optional(),
  borrowerType: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

// ─── PMS (Công tác Đảng) validators ────────────────────────────────────────────

export const partyMemberStatusSchema = z.enum(['active', 'probation', 'retired', 'transferred', 'expelled']);

export const createPartyMemberSchema = z.object({
  vienChucId: z.string().optional(),
  name: z.string().min(1, 'Họ tên không được để trống'),
  dob: z.string().optional(),
  gender: z.enum(['Nam', 'Nữ', 'Khác']).optional(),
  joinPartyDate: z.string().optional(),
  becomeFullMemberDate: z.string().optional(),
  status: partyMemberStatusSchema.default('active'),
  partyPosition: z.string().optional(),
  department: z.string().optional(),
  cell: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
}).strict();

export const updatePartyMemberSchema = createPartyMemberSchema.partial().omit({}).strict();

export const partyMemberQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('joinPartyDate'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  department: z.string().optional(),
  cell: z.string().optional(),
  status: partyMemberStatusSchema.optional(),
});

export const createActivitySchema = z.object({
  name: z.string().min(1, 'Tên hoạt động không được để trống'),
  type: z.enum(['study', 'meeting', 'campaign', 'donation', 'ceremony', 'other']),
  description: z.string().optional(),
  organizer: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  location: z.string().optional(),
  participants: z.array(z.string()).optional().default([]),
  status: z.enum(['planned', 'ongoing', 'completed', 'cancelled']).default('planned'),
  result: z.string().optional(),
}).strict();

export const activityQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('startDate'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  type: z.string().optional(),
  status: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  organizer: z.string().optional(),
});

// ─── Type exports ──────────────────────────────────────────────────────────────

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
export type ReportType = z.infer<typeof reportTypeSchema>;
export type ReportFormat = z.infer<typeof reportFormatSchema>;

export type CreateEvidenceInput = z.infer<typeof createEvidenceSchema>;
export type UpdateEvidenceInput = z.infer<typeof updateEvidenceSchema>;
export type EvidenceQueryInput = z.infer<typeof evidenceQuerySchema>;
export type EvidenceStatus = z.infer<typeof evidenceStatusSchema>;
export type AssessmentType = z.infer<typeof assessmentTypeSchema>;

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type AssessmentQueryInput = z.infer<typeof assessmentQuerySchema>;

export type CreateCompetencyInput = z.infer<typeof createCompetencySchema>;
export type UpdateCompetencyInput = z.infer<typeof updateCompetencySchema>;
export type CompetencyQueryInput = z.infer<typeof competencyQuerySchema>;
export type CompetencyCategory = z.infer<typeof competencyCategorySchema>;
export type CompetencyLevel = z.infer<typeof competencyLevelSchema>;

export type CreateCompetencyAssessmentInput = z.infer<typeof createCompetencyAssessmentSchema>;
export type CompetencyAssessmentQueryInput = z.infer<typeof competencyAssessmentQuerySchema>;

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type BookQueryInput = z.infer<typeof bookQuerySchema>;
export type BookCategory = z.infer<typeof bookCategorySchema>;

export type CreateBorrowRecordInput = z.infer<typeof createBorrowRecordSchema>;
export type BorrowRecordQueryInput = z.infer<typeof borrowRecordQuerySchema>;

export type CreatePartyMemberInput = z.infer<typeof createPartyMemberSchema>;
export type UpdatePartyMemberInput = z.infer<typeof updatePartyMemberSchema>;
export type PartyMemberQueryInput = z.infer<typeof partyMemberQuerySchema>;
export type PartyMemberStatus = z.infer<typeof partyMemberStatusSchema>;

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;
