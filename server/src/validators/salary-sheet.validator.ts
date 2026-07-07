import { z } from 'zod';

export const salarySheetQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  month: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export const createSalarySheetSchema = z.object({
  employeeId: z.string().min(1, 'Nhân viên là bắt buộc'),
  employeeName: z.string().optional(),
  employeeCode: z.string().optional(),
  department: z.string().optional(),
  month: z.string().min(1, 'Tháng là bắt buộc'),
  baseSalary: z.number().min(0, 'Lương cơ bản ≥ 0'),
  allowances: z.number().min(0).default(0),
  deductions: z.number().min(0).default(0),
  bonus: z.number().min(0).default(0),
  status: z.enum(['draft', 'submitted', 'approved', 'paid']).default('draft'),
});

export const updateSalarySheetSchema = createSalarySheetSchema.partial().strict();
