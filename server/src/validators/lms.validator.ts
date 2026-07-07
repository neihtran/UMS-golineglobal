import { z } from 'zod';

// ─── LMS (Dạy học Số) validators ───────────────────────────────────────────────

export const idParamSchema = z.object({ id: z.string().min(1, 'ID không hợp lệ') });

export const courseLevelSchema = z.enum(['basic', 'intermediate', 'advanced']);
export const courseStatusSchema = z.enum(['draft', 'published', 'archived']);

export const createCourseSchema = z.object({
  code: z.string().min(1, 'Mã khóa học không được để trống'),
  name: z.string().min(2, 'Tên khóa học không được để trống'),
  description: z.string().optional(),
  instructor: z.string().optional(),
  instructorName: z.string().optional(),
  department: z.string().optional(),
  departmentName: z.string().optional(),
  credits: z.number().int().min(1).max(10).default(3),
  durationHours: z.number().int().min(1).optional(),
  level: courseLevelSchema.default('intermediate'),
  status: courseStatusSchema.default('draft'),
  thumbnail: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional().default([]),
  enrolledCount: z.number().int().min(0).default(0),
  maxEnrollment: z.number().int().min(0).optional(),
  rating: z.number().min(0).max(5).default(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  syllabus: z.string().optional(),
  prerequisites: z.array(z.string()).optional().default([]),
}).strict();

export const updateCourseSchema = createCourseSchema.partial().omit({ code: true }).strict();

export const courseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  department: z.string().optional(),
  instructor: z.string().optional(),
  level: courseLevelSchema.optional(),
  status: courseStatusSchema.optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
});

// ─── Assignment validators ──────────────────────────────────────────────────────

export const assignmentTypeSchema = z.enum(['homework', 'quiz', 'exam', 'project', 'discussion']);

export const createAssignmentSchema = z.object({
  courseId: z.string().min(1),
  courseCode: z.string().optional(),
  title: z.string().min(1, 'Tiêu đề bài tập không được để trống'),
  description: z.string().optional(),
  type: assignmentTypeSchema.default('homework'),
  maxScore: z.number().positive().default(100),
  dueDate: z.string().optional(),
  attachments: z.array(z.string()).optional().default([]),
  allowLate: z.boolean().default(false),
}).strict();

export const updateAssignmentSchema = createAssignmentSchema.partial().omit({ courseId: true }).strict();

export const assignmentQuerySchema = z.object({
  courseId: z.string().optional(),
  type: assignmentTypeSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Type exports ──────────────────────────────────────────────────────────────

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseQueryInput = z.infer<typeof courseQuerySchema>;
export type CourseLevel = z.infer<typeof courseLevelSchema>;
export type CourseStatus = z.infer<typeof courseStatusSchema>;

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
export type AssignmentQueryInput = z.infer<typeof assignmentQuerySchema>;
export type AssignmentType = z.infer<typeof assignmentTypeSchema>;
