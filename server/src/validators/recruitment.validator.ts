import { z } from 'zod';
import { paginationSchema } from './hrm.validator.js';

export const recruitmentQuerySchema = paginationSchema.extend({
  status: z.string().optional(),
  department: z.string().optional(),
  search: z.string().optional(),
});

export const createRecruitmentSchema = z.object({
  code: z.string().min(1, 'Mã tuyển dụng là bắt buộc'),
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  description: z.string().optional(),
  department: z.string().min(1, 'Đơn vị là bắt buộc'),
  position: z.string().min(1, 'Vị trí là bắt buộc'),
  level: z.string().min(1, 'Trình độ là bắt buộc'),
  slots: z.number().min(1, 'Số lượng ≥ 1'),
  deadline: z.string().optional(),
  method: z.string().min(1, 'Phương thức là bắt buộc'),
  requirements: z.string().optional(),
  status: z.enum(['draft', 'open', 'closed', 'completed', 'cancelled']).default('draft'),
});

export const updateRecruitmentSchema = createRecruitmentSchema.partial().strict();

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID là bắt buộc'),
});

export type RecruitmentQueryInput = z.infer<typeof recruitmentQuerySchema>;
export type CreateRecruitmentInput = z.infer<typeof createRecruitmentSchema>;
export type UpdateRecruitmentInput = z.infer<typeof updateRecruitmentSchema>;
