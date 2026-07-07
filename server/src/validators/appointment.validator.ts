import { z } from 'zod';

export const appointmentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  employeeId: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export const createAppointmentSchema = z.object({
  employeeId: z.string().min(1, 'Nhân viên là bắt buộc'),
  employeeName: z.string().optional(),
  employeeCode: z.string().optional(),
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  type: z.string().min(1, 'Loại là bắt buộc'),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending').optional(),
  fromDate: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
  toDate: z.string().min(1, 'Ngày kết thúc là bắt buộc'),
  note: z.string().optional(),
});

export const updateAppointmentSchema = createAppointmentSchema.partial().strict();
