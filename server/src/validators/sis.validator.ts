import { z } from 'zod';

// ─── Student ────────────────────────────────────────────────────────────────
export const createStudentSchema = z.object({
  code: z.string().min(1, 'Mã sinh viên là bắt buộc'),
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  dob: z.string().optional(),
  gender: z.enum(['Nam', 'Nữ']).optional(),
  cccd: z.string().length(12).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  ethnicity: z.string().optional(),
  department: z.string().min(1, 'Khoa là bắt buộc'),
  courseYear: z.number().int().min(1).max(10),
  className: z.string().optional(),
  enrollmentDate: z.string().min(1, 'Ngày nhập học là bắt buộc'),
});

export const updateStudentSchema = createStudentSchema.partial().extend({
  status: z.enum(['studying', 'graduated', 'suspended', 'expelled', 'reserved']).optional(),
  gpa: z.number().min(0).max(4).optional(),
});

export const studentFiltersSchema = z.object({
  page: z.coerce.number().positive().optional(),
  pageSize: z.coerce.number().positive().max(100).optional(),
  search: z.string().optional(),
  department: z.string().optional(),
  courseYear: z.coerce.number().int().optional(),
  status: z.enum(['studying', 'graduated', 'suspended', 'expelled', 'reserved']).optional(),
});

// ─── Subject ────────────────────────────────────────────────────────────────
export const createSubjectSchema = z.object({
  code: z.string().min(1, 'Mã môn học là bắt buộc'),
  name: z.string().min(2, 'Tên môn học là bắt buộc'),
  credits: z.number().int().min(1).max(10),
  theoryHours: z.number().int().min(0).default(0),
  practiceHours: z.number().int().min(0).default(0),
  description: z.string().optional(),
  department: z.string().optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

// ─── Course ─────────────────────────────────────────────────────────────────
export const createCourseSchema = z.object({
  code: z.string().min(1, 'Mã lớp học phần là bắt buộc'),
  name: z.string().min(2, 'Tên lớp học phần là bắt buộc'),
  subject: z.string().min(1, 'Môn học là bắt buộc'),
  semester: z.number().int().min(1).max(12),
  academicYear: z.string().min(4, 'Năm học là bắt buộc'),
  lecturer: z.string().optional(),
  department: z.string().optional(),
  schedule: z.string().optional(),
  room: z.string().optional(),
  maxStudents: z.number().int().min(1).default(50),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  status: z.enum(['draft', 'open', 'closed', 'cancelled', 'completed']).optional(),
});

// ─── Enrollment ─────────────────────────────────────────────────────────────
export const createEnrollmentSchema = z.object({
  student: z.string().min(1, 'Sinh viên là bắt buộc'),
  course: z.string().min(1, 'Lớp học phần là bắt buộc'),
});

export const gradeEnrollmentSchema = z.object({
  midtermScore: z.number().min(0).max(10).optional(),
  finalScore: z.number().min(0).max(10).optional(),
  attendanceCount: z.number().int().min(0).optional(),
  totalSessions: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

// ─── Curriculum ─────────────────────────────────────────────────────────────
export const createCurriculumSchema = z.object({
  code: z.string().min(1, 'Mã chương trình là bắt buộc'),
  name: z.string().min(2, 'Tên chương trình là bắt buộc'),
  department: z.string().min(1, 'Khoa là bắt buộc'),
  degreeType: z.enum(['Cử nhân', 'Kỹ sư', 'Thạc sĩ', 'Tiến sĩ']),
  durationYears: z.number().int().min(1).max(8),
  totalCredits: z.number().int().min(0),
  subjects: z.array(z.object({
    subject: z.string(),
    semester: z.number().int().min(1).max(12),
    isRequired: z.boolean().default(true),
  })).min(1),
  effectiveYear: z.number().int().min(2000),
  description: z.string().optional(),
});

export const updateCurriculumSchema = createCurriculumSchema.partial().extend({
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type CreateCurriculumInput = z.infer<typeof createCurriculumSchema>;