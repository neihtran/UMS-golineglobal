// ─── Roles constants ───────────────────────────────────────────────────────────────
// These values must match the frontend constants in src/constants/modules.ts

export const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 100,
  HIEU_TRUONG: 80,
  PHO_HIEU_TRUONG: 70,
  TRUONG_KHOA: 60,
  GIAO_VIEN: 40,
  NHAN_VIEN: 20,
  SINH_VIEN: 10,
};

export const MFA_REQUIRED_ROLES: string[] =
  process.env.NODE_ENV === 'production'
    ? ['SUPER_ADMIN', 'HIEU_TRUONG', 'PHO_HIEU_TRUONG']
    : [];

// ─── Module access matrix ───────────────────────────────────────────────────────
export const MODULE_ACCESS: Record<string, string[]> = {
  '/api/iam': ['SUPER_ADMIN'],
  '/api/hrm': ['SUPER_ADMIN', 'NHAN_VIEN'],
  '/api/sis': ['SUPER_ADMIN', 'GIAO_VIEN', 'NHAN_VIEN'],
  '/api/dms': ['SUPER_ADMIN', 'NHAN_VIEN'],
  '/api/fin': ['SUPER_ADMIN', 'NHAN_VIEN'],
  '/api/lms': ['SUPER_ADMIN', 'GIAO_VIEN', 'SINH_VIEN'],
  '/api/exam': ['SUPER_ADMIN', 'GIAO_VIEN', 'SINH_VIEN'],
  '/api/portal': ['SUPER_ADMIN', 'GIAO_VIEN', 'SINH_VIEN', 'NHAN_VIEN'],
  '/api/wms': ['SUPER_ADMIN', 'GIAO_VIEN', 'NHAN_VIEN'],
  '/api/ktx': ['SUPER_ADMIN', 'NHAN_VIEN', 'GIAO_VIEN'],
  '/api/rit': ['SUPER_ADMIN', 'GIAO_VIEN'],
  '/api/bi': ['SUPER_ADMIN', 'NHAN_VIEN', 'HIEU_TRUONG', 'PHO_HIEU_TRUONG'],
  '/api/lib': ['SUPER_ADMIN', 'GIAO_VIEN', 'SINH_VIEN', 'NHAN_VIEN'],
  '/api/qa': ['SUPER_ADMIN', 'GIAO_VIEN', 'NHAN_VIEN'],
  '/api/pms': ['SUPER_ADMIN'],
  '/api/dce': ['SUPER_ADMIN', 'GIAO_VIEN', 'SINH_VIEN'],
  '/api/int': ['SUPER_ADMIN'],
  '/api/ocr': ['SUPER_ADMIN'],
};
