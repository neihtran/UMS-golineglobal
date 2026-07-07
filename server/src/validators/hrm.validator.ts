import { z } from 'zod';

// ─── Common pagination/query validators ──────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID không được để trống'),
});

// ─── User validators ──────────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ chứa chữ, số và _'),
  displayName: z.string().min(2, 'Họ tên không được để trống'),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
  role: z.string().min(1, 'Vai trò không được để trống'),
  department: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
});

export const updateUserSchema = z.object({
  displayName: z.string().min(2).optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  status: z.enum(['active', 'inactive', 'locked', 'pending']).optional(),
  permissions: z.array(z.string()).optional(),
}).strict();

export const userQuerySchema = paginationSchema.extend({
  role: z.string().optional(),
  status: z.enum(['active', 'inactive', 'locked', 'pending']).optional(),
  department: z.string().optional(),
});

// ─── VienChuc validators ────────────────────────────────────────────────────────

export const createVienChucSchema = z.object({
  code: z.string().min(1, 'Mã viên chức không được để trống'),
  name: z.string().min(2, 'Họ tên không được để trống'),
  dob: z.string().optional(),
  gender: z.enum(['Nam', 'Nữ', 'Khác']).optional(),
  cccd: z.string().optional(),
  ethnicity: z.string().optional(),
  religion: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  title: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  contractType: z.enum(['Cơ hữu', 'Thỉnh giảng', 'Thử việc']).optional(),
  salary: z.number().positive().optional(),
  status: z.enum(['active', 'trial', 'leave', 'inactive']).default('active'),
  joinDate: z.string().optional(),
  education: z.string().optional(),
  major: z.string().optional(),
  school: z.string().optional(),
  gradYear: z.number().int().positive().optional(),
  languages: z.array(z.string()).optional(),
  itLevel: z.string().optional(),
  insuranceNumber: z.string().optional(),
  bankAccount: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
}).strict();

export const updateVienChucSchema = createVienChucSchema.partial().omit({ code: true }).strict();

export const vienChucQuerySchema = paginationSchema.extend({
  status: z.enum(['active', 'trial', 'leave', 'inactive']).optional(),
  department: z.string().optional(),
  contractType: z.enum(['Cơ hữu', 'Thỉnh giảng', 'Thử việc']).optional(),
});

// ─── Department validators ───────────────────────────────────────────────────────

export const createDepartmentSchema = z.object({
  code: z.string().min(1).toUpperCase(),
  name: z.string().min(2),
  shortName: z.string().optional(),
  type: z.enum(['faculty', 'department', 'center', 'office', 'institute']),
  parent: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial().omit({ code: true }).strict();

export const departmentQuerySchema = paginationSchema.extend({
  type: z.enum(['faculty', 'department', 'center', 'office', 'institute']).optional(),
  isActive: z.coerce.boolean().optional(),
});

// ─── Type exports ────────────────────────────────────────────────────────────────
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type CreateVienChucInput = z.infer<typeof createVienChucSchema>;
export type UpdateVienChucInput = z.infer<typeof updateVienChucSchema>;
export type VienChucQueryInput = z.infer<typeof vienChucQuerySchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type DepartmentQueryInput = z.infer<typeof departmentQuerySchema>;

// ─── Leave Request validators ────────────────────────────────────────────────────

export const leaveQuerySchema = paginationSchema.extend({
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  employeeId: z.string().optional(),
  type: z.enum(['annual', 'sick', 'unpaid', 'maternity', 'paternity', 'other']).optional(),
});

export const createLeaveSchema = z.object({
  employeeId: z.string().min(1, 'Viên chức không được để trống'),
  type: z.enum(['annual', 'sick', 'unpaid', 'maternity', 'paternity', 'other']),
  startDate: z.string().min(1, 'Ngày bắt đầu không được để trống'),
  endDate: z.string().min(1, 'Ngày kết thúc không được để trống'),
  reason: z.string().min(1, 'Lý do không được để trống'),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'Ngày kết thúc phải sau ngày bắt đầu',
  path: ['endDate'],
});

export const updateLeaveSchema = z.object({
  type: z.enum(['annual', 'sick', 'unpaid', 'maternity', 'paternity', 'other']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  reason: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  rejectionReason: z.string().optional(),
}).strict();

export type LeaveQueryInput = z.infer<typeof leaveQuerySchema>;
export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
export type UpdateLeaveInput = z.infer<typeof updateLeaveSchema>;
