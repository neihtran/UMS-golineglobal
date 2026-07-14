// ─── Auth & IAM types ──────────────────────────────────────────────────────────
import { ROLES, ROLE_LABELS, ROLE_HIERARCHY } from '@/constants/modules';

// Re-export from constants for convenience
export type { Role } from '@/constants/modules';
export { ROLES, ROLE_LABELS, ROLE_HIERARCHY };

// Role aliases — maps shorthand names used in auth demo to full ROLES constants
export const ROLE_ALIASES: Record<string, (typeof ROLES)[keyof typeof ROLES]> = {
  admin: ROLES.ADMIN,
  'hieu-truong': ROLES.HIEU_TRUONG,
  'pho-hieu-truong': ROLES.PHO_HIEU_TRUONG,
  'truong-khoa': ROLES.TRUONG_KHOA,
  'giao-vien': ROLES.GIAO_VIEN,
  'nhan-vien': ROLES.NHAN_VIEN,
  'sinh-vien': ROLES.SINH_VIEN,
};

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  displayName?: string;
  role: (typeof ROLES)[keyof typeof ROLES];
  avatar: string | null;
  permissions: string[];
  unit?: string;
  department?: string;
  title?: string;
  phone?: string;
  status?: string;
  lastLogin?: string;
  mfaEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
