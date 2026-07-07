import { z } from 'zod';

export const idParamSchema = z.object({ id: z.string().min(1, 'ID không hợp lệ') });

// ─── SIS (Sinh viên & Đào tạo) validators ──────────────────────────────────────

export const createStudentSchema = z.object({
  studentId: z.string().min(1, 'Mã sinh viên không được để trống'),
  name: z.string().min(2, 'Họ tên không được để trống'),
  dob: z.string().optional(),
  gender: z.enum(['Nam', 'Nữ', 'Khác']).optional(),
  cccd: z.string().optional(),
  ethnicity: z.string().optional(),
  religion: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  department: z.string().optional(),
  major: z.string().optional(),
  educationLevel: z.enum(['CĐ', 'TC', 'ĐH', 'CQ', 'LV', 'TH']).optional(),
  className: z.string().optional(),
  admissionDate: z.string().optional(),
  expectedGradDate: z.string().optional(),
  status: z.enum(['studying', 'graduated', 'suspended', 'transferred', 'dropped']).default('studying'),
  gpa: z.number().min(0).max(10).optional(),
  creditsEarned: z.number().int().min(0).optional(),
  creditsRequired: z.number().int().min(0).optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
}).strict();

export const updateStudentSchema = createStudentSchema.partial().omit({ studentId: true }).strict();

export const studentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  department: z.string().optional(),
  className: z.string().optional(),
  status: z.enum(['studying', 'graduated', 'suspended', 'transferred', 'dropped']).optional(),
  educationLevel: z.enum(['CĐ', 'TC', 'ĐH', 'CQ', 'LV', 'TH']).optional(),
});

// ─── Subject validators ─────────────────────────────────────────────────────────

export const createSubjectSchema = z.object({
  code: z.string().min(1, 'Mã môn học không được để trống'),
  name: z.string().min(2, 'Tên môn học không được để trống'),
  credits: z.number().int().min(1).max(10),
  theoryHours: z.number().int().min(0).default(0),
  practiceHours: z.number().int().min(0).default(0),
  department: z.string().optional(),
  departmentName: z.string().optional(),
  prereqIds: z.array(z.string()).optional().default([]),
  semesterOffered: z.array(z.string()).optional().default(['1', '2']),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
}).strict();

export const updateSubjectSchema = createSubjectSchema.partial().omit({ code: true }).strict();

export const subjectQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('code'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),
  department: z.string().optional(),
  credits: z.coerce.number().int().positive().optional(),
  isActive: z.coerce.boolean().optional(),
});

// ─── Enrollment validators ──────────────────────────────────────────────────────

export const createEnrollmentSchema = z.object({
  studentId: z.string().min(1),
  subjectId: z.string().min(1),
  semester: z.string().min(1),
  academicYear: z.string().min(1),
  classGroup: z.string().optional(),
  status: z.enum(['registered', 'studying', 'completed', 'dropped', 'failed']).default('registered'),
  scoreFormative: z.number().min(0).max(10).optional(),
  scoreMidterm: z.number().min(0).max(10).optional(),
  scoreFinal: z.number().min(0).max(10).optional(),
  grade: z.string().optional(),
  note: z.string().optional(),
}).strict();

export const updateEnrollmentSchema = createEnrollmentSchema.partial().omit({ studentId: true, subjectId: true, semester: true, academicYear: true }).strict();

export const enrollmentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().default('academicYear'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  studentId: z.string().optional(),
  subjectId: z.string().optional(),
  semester: z.string().optional(),
  academicYear: z.string().optional(),
  classGroup: z.string().optional(),
  status: z.string().optional(),
});

// ─── Curriculum validators ──────────────────────────────────────────────────────

export const createCurriculumSchema = z.object({
  name: z.string().min(2, 'Tên chương trình không được để trống'),
  code: z.string().min(1),
  educationLevel: z.enum(['CĐ', 'TC', 'ĐH', 'CQ', 'LV', 'TH']),
  department: z.string().optional(),
  totalCredits: z.number().int().min(1),
  durationYears: z.number().int().min(1).max(10),
  startYear: z.number().int().min(1990).max(2100),
  status: z.enum(['draft', 'active', 'archived']).default('active'),
  description: z.string().optional(),
}).strict();

export const updateCurriculumSchema = createCurriculumSchema.partial().omit({ code: true }).strict();

export const curriculumQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('startYear'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  educationLevel: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

// ─── Internship validators ──────────────────────────────────────────────────────

export const createInternshipSchema = z.object({
  studentId: z.string().min(1),
  studentName: z.string().optional(),
  companyName: z.string().min(1),
  companyAddress: z.string().optional(),
  position: z.string().optional(),
  mentorName: z.string().optional(),
  mentorPhone: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  status: z.enum(['registered', 'in_progress', 'completed', 'failed']).default('registered'),
  reportUrl: z.string().url().optional().or(z.literal('')),
  grade: z.number().min(0).max(10).optional(),
  note: z.string().optional(),
}).strict();

export const updateInternshipSchema = createInternshipSchema.partial().omit({ studentId: true }).strict();

export const internshipQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().default('startDate'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  studentId: z.string().optional(),
  status: z.string().optional(),
  companyName: z.string().optional(),
});

// ─── Graduation validators ──────────────────────────────────────────────────────

export const graduationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('graduationDate'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  academicYear: z.string().optional(),
  sessionStatus: z.enum(['upcoming', 'open', 'closed']).optional(),
});

// ─── Type exports ──────────────────────────────────────────────────────────────

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type StudentQueryInput = z.infer<typeof studentQuerySchema>;

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type SubjectQueryInput = z.infer<typeof subjectQuerySchema>;

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
export type EnrollmentQueryInput = z.infer<typeof enrollmentQuerySchema>;

export type CreateCurriculumInput = z.infer<typeof createCurriculumSchema>;
export type UpdateCurriculumInput = z.infer<typeof updateCurriculumSchema>;
export type CurriculumQueryInput = z.infer<typeof curriculumQuerySchema>;

export type CreateInternshipInput = z.infer<typeof createInternshipSchema>;
export type UpdateInternshipInput = z.infer<typeof updateInternshipSchema>;
export type InternshipQueryInput = z.infer<typeof internshipQuerySchema>;

export type GraduationQueryInput = z.infer<typeof graduationQuerySchema>;
