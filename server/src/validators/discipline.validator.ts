import { z } from 'zod';

export const disciplineQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  type: z.string().optional(),
  employeeId: z.string().optional(),
  search: z.string().optional(),
});

export const createDisciplineSchema = z.object({
  employeeId: z.string().min(1, 'Nhân viên là bắt buộc'),
  employeeName: z.string().optional(),
  employeeCode: z.string().optional(),
  type: z.enum(['warning', 'reprimand', 'demotion', 'dismissal']),
  reason: z.string().min(1, 'Lý do là bắt buộc'),
  description: z.string().optional(),
  date: z.string().optional(),
  decisionNo: z.string().optional(),
});

export const updateDisciplineSchema = createDisciplineSchema.partial().strict();
