import { z } from 'zod';

export const createVienChucSchema = z.object({
  code: z.string().min(1, 'Mã viên chức là bắt buộc'),
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  dob: z.string().optional(),
  cccd: z.string().length(12, 'CCCD phải có 12 số').optional(),
  gender: z.enum(['Nam', 'Nữ']).optional(),
  ethnicity: z.string().optional(),
  religion: z.string().optional(),
  address: z.string().optional(),
  contact: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  title: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  contractType: z.enum(['Cơ hữu', 'Thỉnh giảng', 'Thử việc']).optional(),
  salary: z.number().positive().optional(),
  joinDate: z.string().optional(),
  education: z.string().optional(),
  major: z.string().optional(),
  school: z.string().optional(),
  gradYear: z.number().int().optional(),
});

export const updateVienChucSchema = createVienChucSchema.partial().extend({
  status: z.enum(['active', 'trial', 'leave', 'inactive']).optional(),
});

export const VienChucFiltersSchema = z.object({
  page: z.coerce.number().positive().optional(),
  pageSize: z.coerce.number().positive().max(100).optional(),
  search: z.string().optional(),
  status: z.enum(['active', 'trial', 'leave', 'inactive']).optional(),
  department: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

export const createDepartmentSchema = z.object({
  code: z.string().min(1, 'Mã đơn vị là bắt buộc'),
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  shortName: z.string().optional(),
  type: z.enum(['faculty', 'department', 'center', 'office']),
  parent: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
});

export const createLeaveRequestSchema = z.object({
  type: z.enum(['annual', 'sick', 'unpaid', 'maternity', 'paternity', 'other']),
  startDate: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
  endDate: z.string().min(1, 'Ngày kết thúc là bắt buộc'),
  reason: z.string().min(10, 'Lý do phải có ít nhất 10 ký tự'),
});

// ─── Contract Management ────────────────────────────────────────────────────
export const createContractSchema = z.object({
  code: z.string().min(1, 'Mã hợp đồng là bắt buộc'),
  employee: z.string().min(1, 'Nhân viên là bắt buộc'),
  type: z.enum(['Cơ hữu', 'Thỉnh giảng', 'Thử việc', 'Cộng tác viên']),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  salary: z.number().nonnegative(),
  notes: z.string().optional(),
});

export const updateContractSchema = createContractSchema.partial().extend({
  status: z.enum(['active', 'expired', 'terminated', 'pending']).optional(),
});

// ─── Salary Sheet Management ────────────────────────────────────────────────
export const createSalarySheetSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  department: z.string().optional(),
  items: z.array(z.object({
    employee: z.string(),
    baseSalary: z.number().nonnegative(),
    allowance: z.number().nonnegative().default(0),
    bonus: z.number().nonnegative().default(0),
    deduction: z.number().nonnegative().default(0),
    insurance: z.number().nonnegative().default(0),
    tax: z.number().nonnegative().default(0),
  })).min(1, 'Phải có ít nhất 1 nhân viên'),
  notes: z.string().optional(),
});

export type CreateVienChucInput = z.infer<typeof createVienChucSchema>;
export type UpdateVienChucInput = z.infer<typeof updateVienChucSchema>;
export type VienChucFiltersInput = z.infer<typeof VienChucFiltersSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
export type CreateSalarySheetInput = z.infer<typeof createSalarySheetSchema>;
