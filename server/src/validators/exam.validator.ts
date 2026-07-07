import { z } from 'zod';

// ─── EXAM (Thi trực tuyến) validators ──────────────────────────────────────────

export const idParamSchema = z.object({ id: z.string().min(1, 'ID không hợp lệ') });

export const examStatusSchema = z.enum(['draft', 'published', 'ongoing', 'finished', 'graded']);
export const examTypeSchema = z.enum(['midterm', 'final', 'quiz', 'practice', 'remake']);
export const questionTypeSchema = z.enum(['single_choice', 'multiple_choice', 'essay', 'true_false', 'fill_blank']);
export const questionDifficultySchema = z.enum(['easy', 'medium', 'hard']);

export const createExamSchema = z.object({
  code: z.string().min(1, 'Mã kỳ thi không được để trống'),
  name: z.string().min(1, 'Tên kỳ thi không được để trống'),
  type: examTypeSchema.default('quiz'),
  status: examStatusSchema.default('draft'),
  subjectId: z.string().optional(),
  subjectName: z.string().optional(),
  department: z.string().optional(),
  instructor: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  durationMinutes: z.number().int().positive().default(60),
  totalQuestions: z.number().int().min(1).optional(),
  totalScore: z.number().positive().default(100),
  passScore: z.number().min(0).default(50),
  allowedAttempts: z.number().int().min(1).default(1),
  shuffleQuestions: z.boolean().default(true),
  showResult: z.boolean().default(true),
  allowReview: z.boolean().default(true),
  plagiarismCheck: z.boolean().default(false),
  eyeTracking: z.boolean().default(false),
  lockBrowser: z.boolean().default(true),
  description: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
}).strict();

export const updateExamSchema = createExamSchema.partial().omit({ code: true }).strict();

export const examQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('startTime'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  subjectId: z.string().optional(),
  type: examTypeSchema.optional(),
  status: examStatusSchema.optional(),
  instructor: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

// ─── Question validators ────────────────────────────────────────────────────────

export const createQuestionSchema = z.object({
  examId: z.string().optional(),
  subjectId: z.string().optional(),
  subjectName: z.string().optional(),
  type: questionTypeSchema,
  difficulty: questionDifficultySchema.default('medium'),
  content: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
  options: z.array(z.object({
    label: z.string(),
    content: z.string(),
    isCorrect: z.boolean().default(false),
  })).optional().default([]),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
  points: z.number().positive().default(1),
  tags: z.array(z.string()).optional().default([]),
  usageCount: z.number().int().min(0).default(0),
}).strict();

export const updateQuestionSchema = createQuestionSchema.partial().omit({}).strict();

export const questionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  examId: z.string().optional(),
  subjectId: z.string().optional(),
  type: questionTypeSchema.optional(),
  difficulty: questionDifficultySchema.optional(),
  tags: z.string().optional(),
});

// ─── ExamSession validators ─────────────────────────────────────────────────────

export const examSessionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('startTime'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  examId: z.string().optional(),
  studentId: z.string().optional(),
  status: z.string().optional(),
});

// ─── ExamResult validators ──────────────────────────────────────────────────────

export const examResultQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('submittedAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  examId: z.string().optional(),
  studentId: z.string().optional(),
  minScore: z.coerce.number().optional(),
  maxScore: z.coerce.number().optional(),
});

// ─── Type exports ──────────────────────────────────────────────────────────────

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
export type ExamQueryInput = z.infer<typeof examQuerySchema>;
export type ExamStatus = z.infer<typeof examStatusSchema>;
export type ExamType = z.infer<typeof examTypeSchema>;

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type QuestionQueryInput = z.infer<typeof questionQuerySchema>;
export type QuestionType = z.infer<typeof questionTypeSchema>;
export type QuestionDifficulty = z.infer<typeof questionDifficultySchema>;

export type ExamSessionQueryInput = z.infer<typeof examSessionQuerySchema>;
export type ExamResultQueryInput = z.infer<typeof examResultQuerySchema>;
