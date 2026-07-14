import { z } from 'zod';
import { ROLES } from '../models/User.js';

// ─── User Management ────────────────────────────────────────────────────────
export const createUserSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  username: z.string().min(3, 'Username phải có ít nhất 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  displayName: z.string().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự'),
  role: z.enum(Object.values(ROLES) as [string, ...string[]]),
  title: z.string().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export const updateUserSchema = createUserSchema
  .pick({
    displayName: true, role: true, title: true, phone: true,
    department: true, permissions: true,
  })
  .partial();

export const userFiltersSchema = z.object({
  page: z.coerce.number().positive().optional(),
  pageSize: z.coerce.number().positive().max(100).optional(),
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(['active', 'inactive', 'locked', 'pending']).optional(),
  department: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

// ─── Role Management ────────────────────────────────────────────────────────
export const createRoleSchema = z.object({
  code: z.enum(Object.values(ROLES) as [string, ...string[]]),
  name: z.string().min(2, 'Tên role phải có ít nhất 2 ký tự'),
  description: z.string().optional(),
  level: z.number().int().min(0).max(100),
  permissions: z.array(z.string()).default([]),
});

export const updateRoleSchema = createRoleSchema.partial();

// ─── Tenant Management ──────────────────────────────────────────────────────
export const createTenantSchema = z.object({
  code: z.string().min(2, 'Mã tenant phải có ít nhất 2 ký tự'),
  name: z.string().min(2, 'Tên tenant là bắt buộc'),
  shortName: z.string().optional(),
  domain: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  type: z.enum(['university', 'school', 'department', 'training_center']).default('university'),
  plan: z.enum(['basic', 'standard', 'premium', 'enterprise']).default('standard'),
  maxUsers: z.number().int().positive().default(1000),
  storageQuotaGb: z.number().int().positive().default(100),
  expiresAt: z.string().optional(),
});

export const updateTenantSchema = createTenantSchema.partial();

// ─── Audit Log Query ────────────────────────────────────────────────────────
export const auditLogFiltersSchema = z.object({
  page: z.coerce.number().positive().optional(),
  pageSize: z.coerce.number().positive().max(200).optional(),
  userId: z.string().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  status: z.enum(['success', 'failure']).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserFiltersInput = z.infer<typeof userFiltersSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type AuditLogFiltersInput = z.infer<typeof auditLogFiltersSchema>;