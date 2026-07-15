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
  effectiveYear: z.number().int().min(2000),
  subjects: z.array(z.object({
    subject: z.string(),
    semester: z.number().int().min(1).max(12),
    isRequired: z.boolean().default(true),
  })).min(1),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

export const updateCurriculumSchema = createCurriculumSchema.partial().extend({
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

// ─── Enrollment update ──────────────────────────────────────────────────────
export const updateEnrollmentSchema = z.object({
  student: z.string().optional(),
  course: z.string().optional(),
  status: z.enum(['enrolled', 'in_progress', 'completed', 'failed', 'withdrawn']).optional(),
  midtermScore: z.number().min(0).max(10).optional(),
  finalScore: z.number().min(0).max(10).optional(),
  attendanceCount: z.number().int().min(0).optional(),
  totalSessions: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

// ─── Graduation Session ─────────────────────────────────────────────────────
export const createGraduationSessionSchema = z.object({
  name: z.string().min(2, 'Tên đợt xét là bắt buộc'),
  semester: z.string().min(1, 'Học kỳ là bắt buộc'),
  academicYear: z.string().min(4, 'Năm học là bắt buộc'),
  openDate: z.string().min(1, 'Ngày mở đơn là bắt buộc'),
  closeDate: z.string().min(1, 'Ngày đóng đơn là bắt buộc'),
  reviewDate: z.string().optional(),
  status: z.enum(['draft', 'open', 'closed', 'reviewed']).optional(),
  description: z.string().optional(),
  totalCandidates: z.number().int().min(0).optional(),
});

export const updateGraduationSessionSchema = createGraduationSessionSchema.partial();

// ─── Graduation ─────────────────────────────────────────────────────────────
export const createGraduationSchema = z.object({
  student: z.string().min(1, 'Sinh viên là bắt buộc'),
  session: z.string().min(1, 'Đợt xét là bắt buộc'),
  cohort: z.string().min(1, 'Khóa học là bắt buộc'),
  enrollmentDate: z.string().min(1, 'Ngày nhập học là bắt buộc'),
  graduationYear: z.number().int().min(2000).max(2100),
  graduationSemester: z.string().min(1, 'Học kỳ tốt nghiệp là bắt buộc'),
  gpa: z.number().min(0).max(4),
  totalCredits: z.number().int().min(0),
  thesisTitle: z.string().optional(),
  thesisScore: z.number().min(0).max(10).optional(),
  thesisAdvisor: z.string().optional(),
  thesisDefendedAt: z.string().optional(),
  degree: z.enum(['Xuất sắc', 'Giỏi', 'Khá', 'Trung bình']),
  diplomaNo: z.string().optional(),
  diplomaDate: z.string().optional(),
  status: z.enum(['pending_review', 'graduated', 'diploma_issued', 'not_met']).optional(),
  conditions: z.array(z.object({
    code: z.string(),
    label: z.string(),
    required: z.string(),
    actual: z.string(),
    met: z.boolean(),
  })).optional(),
  notes: z.string().optional(),
});

export const updateGraduationSchema = createGraduationSchema.partial();

// ─── Internship ─────────────────────────────────────────────────────────────
export const createInternshipSchema = z.object({
  student: z.string().min(1, 'Sinh viên là bắt buộc'),
  studentCode: z.string().min(1, 'Mã sinh viên là bắt buộc'),
  studentName: z.string().min(2, 'Tên sinh viên là bắt buộc'),
  className: z.string().optional(),
  major: z.string().optional(),
  department: z.string().optional(),
  company: z.string().min(2, 'Tên công ty là bắt buộc'),
  position: z.string().min(1, 'Vị trí thực tập là bắt buộc'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
  endDate: z.string().min(1, 'Ngày kết thúc là bắt buộc'),
  supervisor: z.string().optional(),
  supervisorPhone: z.string().optional(),
  supervisorEmail: z.string().email().optional(),
  status: z.enum(['registered', 'in_progress', 'pending_report', 'completed', 'rejected']).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  reportSubmitted: z.boolean().optional(),
  grade: z.number().min(0).max(10).optional(),
  description: z.string().optional(),
});

export const updateInternshipSchema = createInternshipSchema.partial();

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
export type CreateCurriculumInput = z.infer<typeof createCurriculumSchema>;
export type CreateGraduationSessionInput = z.infer<typeof createGraduationSessionSchema>;
export type CreateGraduationInput = z.infer<typeof createGraduationSchema>;
export type CreateInternshipInput = z.infer<typeof createInternshipSchema>;