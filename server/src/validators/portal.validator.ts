import { z } from 'zod';

// ─── PORTAL (Cổng thông tin) validators ────────────────────────────────────────

export const idParamSchema = z.object({ id: z.string().min(1, 'ID không hợp lệ') });

export const announcementStatusSchema = z.enum(['draft', 'published', 'archived', 'pinned']);
export const announcementCategorySchema = z.enum([
  'news', 'event', 'academic', 'hr', 'finance', 'general', 'urgent'
]);

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  content: z.string().min(1, 'Nội dung không được để trống'),
  summary: z.string().optional(),
  category: announcementCategorySchema.default('general'),
  status: announcementStatusSchema.default('published'),
  author: z.string().optional(),
  authorName: z.string().optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  attachments: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  department: z.string().optional(),
  targetRoles: z.array(z.string()).optional().default([]),
  pinnedAt: z.string().optional(),
  publishAt: z.string().optional(),
  expiresAt: z.string().optional(),
}).strict();

export const updateAnnouncementSchema = createAnnouncementSchema.partial().omit({}).strict();

export const announcementQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  category: announcementCategorySchema.optional(),
  status: announcementStatusSchema.optional(),
  author: z.string().optional(),
  tag: z.string().optional(),
});

// ─── FIN (Tài chính & Kế toán) validators ──────────────────────────────────────

export const paymentStatusSchema = z.enum(['unpaid', 'partial', 'paid', 'overdue', 'refunded', 'waived']);
export const expenseCategorySchema = z.enum([
  'personnel', 'equipment', 'infrastructure', 'research',
  'training', 'student_support', 'administrative', 'other'
]);
export const expenditureStatusSchema = z.enum(['draft', 'pending', 'approved', 'rejected', 'completed']);

export const createTuitionSchema = z.object({
  studentId: z.string().min(1),
  studentName: z.string().optional(),
  semester: z.string().min(1),
  academicYear: z.string().min(1),
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  paidAmount: z.number().min(0).default(0),
  status: paymentStatusSchema.default('unpaid'),
  paymentMethod: z.string().optional(),
  paidAt: z.string().optional(),
  dueDate: z.string().optional(),
  note: z.string().optional(),
}).strict();

export const tuitionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  studentId: z.string().optional(),
  studentName: z.string().optional(),
  semester: z.string().optional(),
  academicYear: z.string().optional(),
  status: paymentStatusSchema.optional(),
  fromAmount: z.coerce.number().min(0).optional(),
  toAmount: z.coerce.number().min(0).optional(),
});

export const createExpenditureSchema = z.object({
  name: z.string().min(1, 'Tên khoản chi không được để trống'),
  category: expenseCategorySchema.default('administrative'),
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  department: z.string().optional(),
  applicant: z.string().optional(),
  approver: z.string().optional(),
  reason: z.string().optional(),
  status: expenditureStatusSchema.default('draft'),
  requestDate: z.string().optional(),
  approveDate: z.string().optional(),
  notes: z.string().optional(),
}).strict();

export const expenditureQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('requestDate'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  department: z.string().optional(),
  category: expenseCategorySchema.optional(),
  status: expenditureStatusSchema.optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
});

// ─── KTX (Ký túc xá) validators ────────────────────────────────────────────────

export const roomStatusSchema = z.enum(['available', 'occupied', 'maintenance', 'reserved']);
export const roomTypeSchema = z.enum(['4_bed', '6_bed', '8_bed', 'single', 'double']);
export const registrationStatusSchema = z.enum(['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled']);

export const createRoomSchema = z.object({
  code: z.string().min(1, 'Mã phòng không được để trống'),
  building: z.string().min(1, 'Tòa nhà không được để trống'),
  floor: z.number().int().min(0),
  roomNumber: z.string().min(1),
  type: roomTypeSchema,
  capacity: z.number().int().min(1).max(20),
  currentOccupancy: z.number().int().min(0).default(0),
  monthlyFee: z.number().positive().optional(),
  status: roomStatusSchema.default('available'),
  amenities: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
  images: z.array(z.string()).optional().default([]),
}).strict();

export const updateRoomSchema = createRoomSchema.partial().omit({ code: true }).strict();

export const roomQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('building'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
  building: z.string().optional(),
  type: roomTypeSchema.optional(),
  status: roomStatusSchema.optional(),
  minCapacity: z.coerce.number().int().min(1).optional(),
});

export const createRegistrationSchema = z.object({
  studentId: z.string().min(1),
  studentName: z.string().optional(),
  roomId: z.string().min(1),
  roomCode: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  reason: z.string().optional(),
  note: z.string().optional(),
}).strict();

export const registrationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  studentId: z.string().optional(),
  roomId: z.string().optional(),
  status: registrationStatusSchema.optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

// ─── RIT (NCKH & HTQT) validators ──────────────────────────────────────────────

export const projectStatusSchema = z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']);
export const projectTypeSchema = z.enum(['research', 'application', 'international', 'tech_transfer']);

export const createResearchProjectSchema = z.object({
  code: z.string().min(1, 'Mã đề tài không được để trống'),
  name: z.string().min(1, 'Tên đề tài không được để trống'),
  type: projectTypeSchema.default('research'),
  status: projectStatusSchema.default('planning'),
  principal: z.string().optional(),
  principalName: z.string().optional(),
  members: z.array(z.string()).optional().default([]),
  department: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  funding: z.number().positive().optional(),
  fundingUnit: z.string().optional(),
  result: z.string().optional(),
  description: z.string().optional(),
  publications: z.array(z.object({
    title: z.string(),
    journal: z.string().optional(),
    year: z.number().optional(),
  })).optional().default([]),
}).strict();

export const updateResearchProjectSchema = createResearchProjectSchema.partial().omit({ code: true }).strict();

export const researchProjectQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('startDate'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  type: projectTypeSchema.optional(),
  status: projectStatusSchema.optional(),
  department: z.string().optional(),
  principal: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

// ─── Type exports ──────────────────────────────────────────────────────────────

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type AnnouncementQueryInput = z.infer<typeof announcementQuerySchema>;
export type AnnouncementStatus = z.infer<typeof announcementStatusSchema>;
export type AnnouncementCategory = z.infer<typeof announcementCategorySchema>;

export type CreateTuitionInput = z.infer<typeof createTuitionSchema>;
export type TuitionQueryInput = z.infer<typeof tuitionQuerySchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export type CreateExpenditureInput = z.infer<typeof createExpenditureSchema>;
export type ExpenditureQueryInput = z.infer<typeof expenditureQuerySchema>;
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;
export type ExpenditureStatus = z.infer<typeof expenditureStatusSchema>;

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type RoomQueryInput = z.infer<typeof roomQuerySchema>;
export type RoomStatus = z.infer<typeof roomStatusSchema>;
export type RoomType = z.infer<typeof roomTypeSchema>;

export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
export type RegistrationQueryInput = z.infer<typeof registrationQuerySchema>;
export type RegistrationStatus = z.infer<typeof registrationStatusSchema>;

export type CreateResearchProjectInput = z.infer<typeof createResearchProjectSchema>;
export type UpdateResearchProjectInput = z.infer<typeof updateResearchProjectSchema>;
export type ResearchProjectQueryInput = z.infer<typeof researchProjectQuerySchema>;
export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type ProjectType = z.infer<typeof projectTypeSchema>;
