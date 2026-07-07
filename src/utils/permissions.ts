import type { User } from '@/types/common.types';

// Use a simple string-based role hierarchy since we have different Role types
type SimpleRole = string;

const ROLE_HIERARCHY: Record<string, number> = {
  'SUPER_ADMIN': 100,
  'HIEU_TRUONG': 80,
  'PHO_HIEU_TRUONG': 70,
  'TRUONG_KHOA': 60,
  'GIAO_VIEN': 40,
  'NHAN_VIEN': 20,
  'SINH_VIEN': 10,
};

// ─── Role-based permission check ──────────────────────────────────────────────

export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return user.permissions.includes(permission);
}

export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  return permissions.some((p) => hasPermission(user, p));
}

export function hasAllPermissions(user: User | null, permissions: string[]): boolean {
  return permissions.every((p) => hasPermission(user, p));
}

// ─── Role hierarchy ───────────────────────────────────────────────────────────

export function canManageRole(managerRole: SimpleRole, targetRole: SimpleRole): boolean {
  const managerLevel = ROLE_HIERARCHY[managerRole] ?? 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] ?? 0;
  return managerLevel > targetLevel;
}

export function isAtLeast(userRole: SimpleRole, requiredRole: SimpleRole): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

// ─── Module access ────────────────────────────────────────────────────────────

export function canAccessModule(user: User | null, module: string): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return user.permissions.some((p) => p.startsWith(module.split('-')[0].toLowerCase()));
}

// ─── Resource ownership ────────────────────────────────────────────────────────

export function canAccessResource(
  user: User | null,
  resourceDept: string,
  scope: 'own' | 'department' | 'all'
): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  if (scope === 'all') return false;
  if (scope === 'department') return user.department === resourceDept;
  return true; // scope === 'own'
}

// ─── MFA validation ───────────────────────────────────────────────────────────

export function isMFASetupRequired(user: User | null): boolean {
  if (!user) return false;
  const HIGH_ROLES = ['SUPER_ADMIN', 'HIEU_TRUONG', 'PHO_HIEU_TRUONG'];
  return HIGH_ROLES.includes(user.role);
}

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Yếu', color: 'error' };
  if (score <= 4) return { score, label: 'Trung bình', color: 'warning' };
  return { score, label: 'Mạnh', color: 'success' };
}

// ─── Session validation ────────────────────────────────────────────────────────

export function isSessionExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

export function getSessionTimeRemaining(expiresAt: string): number {
  return Math.max(0, new Date(expiresAt).getTime() - Date.now());
}

// ─── Audit action labels ─────────────────────────────────────────────────────

export function getAuditActionLabel(action: string): string {
  const LABELS: Record<string, string> = {
    'LOGIN': 'Đăng nhập',
    'LOGOUT': 'Đăng xuất',
    'LOGIN_FAILED': 'Đăng nhập thất bại',
    'CREATE': 'Tạo mới',
    'UPDATE': 'Cập nhật',
    'DELETE': 'Xóa',
    'LOCK': 'Khóa tài khoản',
    'UNLOCK': 'Mở khóa',
    'CHANGE_PASSWORD': 'Đổi mật khẩu',
    'RESET_PASSWORD': 'Đặt lại mật khẩu',
    'ENABLE_MFA': 'Bật MFA',
    'DISABLE_MFA': 'Tắt MFA',
    'APPROVE': 'Phê duyệt',
    'REJECT': 'Từ chối',
    'EXPORT': 'Xuất dữ liệu',
    'IMPORT': 'Nhập dữ liệu',
    'VIEW': 'Xem',
    'DOWNLOAD': 'Tải xuống',
    'UPLOAD': 'Tải lên',
  };
  return LABELS[action] ?? action;
}
