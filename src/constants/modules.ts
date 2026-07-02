// ─── Module registry ──────────────────────────────────────────────────────────
// Maps module codes to their display names and colors

export const MODULE_NAMES: Record<string, string> = {
  iam: 'Quản trị Hệ thống',
  hrm: 'Nhân sự',
  sis: 'Đào tạo & Sinh viên',
  dms: 'Văn bản Điện tử',
  fin: 'Tài chính & Kế toán',
  lms: 'Dạy học Số',
  exam: 'Thi trực tuyến',
  portal: 'Cổng thông tin',
  lib: 'Thư viện',
  wms: 'Quản lý Công việc',
  ktx: 'Ký túc xá',
  rit: 'NCKH & HTQT',
  bi: 'Phân tích Dữ liệu',
  int: 'Tích hợp',
  ocr: 'Số hóa Tài liệu',
  dce: 'Năng lực Số',
  pms: 'Công tác Đảng',
  qa: 'Kiểm định Chất lượng',
};

// ─── Color palette per module ─────────────────────────────────────────────────
export const MODULE_COLORS: Record<string, string> = {
  iam: '#1E3A5F',
  hrm: '#2D5D8A',
  sis: '#16A34A',
  dms: '#7C3AED',
  fin: '#EA580C',
  lms: '#0369A1',
  exam: '#BE185D',
  portal: '#B45309',
  lib: '#0D9488',
  wms: '#9333EA',
  ktx: '#EA580C',
  rit: '#0891B2',
  bi: '#BE185D',
  int: '#059669',
  ocr: '#CA8A04',
  dce: '#7C3AED',
  pms: '#DC2626',
  qa: '#EA580C',
};

// ─── Role definitions ──────────────────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  HIEU_TRUONG: 'HIEU_TRUONG',
  PHO_HIEU_TRUONG: 'PHO_HIEU_TRUONG',
  TRUONG_KHOA: 'TRUONG_KHOA',
  PHO_TRUONG_KHOA: 'PHO_TRUONG_KHOA',
  GIAO_VIEN: 'GIAO_VIEN',
  CAN_BO_PHAN_CONG: 'CAN_BO_PHAN_CONG',
  CHUYEN_VIEN: 'CHUYEN_VIEN',
  NHAN_VIEN: 'NHAN_VIEN',
  SINH_VIEN: 'SINH_VIEN',
  KHAI_THA: 'KHAI_THA',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: 'Quản trị viên hệ thống',
  [ROLES.ADMIN]: 'Quản trị viên',
  [ROLES.HIEU_TRUONG]: 'Hiệu trưởng',
  [ROLES.PHO_HIEU_TRUONG]: 'Phó Hiệu trưởng',
  [ROLES.TRUONG_KHOA]: 'Trưởng khoa',
  [ROLES.PHO_TRUONG_KHOA]: 'Phó trưởng khoa',
  [ROLES.GIAO_VIEN]: 'Giảng viên',
  [ROLES.CAN_BO_PHAN_CONG]: 'Cán bộ phân công',
  [ROLES.CHUYEN_VIEN]: 'Chuyên viên',
  [ROLES.NHAN_VIEN]: 'Nhân viên',
  [ROLES.SINH_VIEN]: 'Sinh viên',
  [ROLES.KHAI_THA]: 'Khải thác',
};

export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.ADMIN]: 90,
  [ROLES.HIEU_TRUONG]: 80,
  [ROLES.PHO_HIEU_TRUONG]: 70,
  [ROLES.TRUONG_KHOA]: 60,
  [ROLES.PHO_TRUONG_KHOA]: 50,
  [ROLES.GIAO_VIEN]: 40,
  [ROLES.CAN_BO_PHAN_CONG]: 35,
  [ROLES.CHUYEN_VIEN]: 30,
  [ROLES.NHAN_VIEN]: 20,
  [ROLES.SINH_VIEN]: 10,
  [ROLES.KHAI_THA]: 5,
};

// ─── Permission constants ─────────────────────────────────────────────────────
export const PERMISSIONS = {
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_LOCK: 'user:lock',
  AUDIT_READ: 'audit:read',

  VC_CREATE: 'vc:create',
  VC_READ: 'vc:read',
  VC_UPDATE: 'vc:update',
  VC_DELETE: 'vc:delete',

  STUDENT_CREATE: 'student:create',
  STUDENT_READ: 'student:read',
  STUDENT_UPDATE: 'student:update',
  STUDENT_DELETE: 'student:delete',

  TUITION_READ: 'tuition:read',
  TUITION_UPDATE: 'tuition:update',

  EXAM_CREATE: 'exam:create',
  EXAM_READ: 'exam:read',
  EXAM_MONITOR: 'exam:monitor',

  DOC_CREATE: 'doc:create',
  DOC_SIGN: 'doc:sign',
  DOC_APPROVE: 'doc:approve',

  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export',

  SETTING_UPDATE: 'setting:update',
} as const;

// ─── Leave type labels ───────────────────────────────────────────────────────
export const LEAVE_TYPES = {
  annual: { label: 'Nghỉ phép năm', color: 'primary' },
  sick: { label: 'Nghỉ ốm', color: 'warning' },
  unpaid: { label: 'Nghỉ không lương', color: 'neutral' },
  maternity: { label: 'Nghỉ thai sản', color: 'accent' },
  paternity: { label: 'Nghỉ thăm nom', color: 'accent' },
  other: { label: 'Khác', color: 'info' },
} as const;

// ─── Grade thresholds ─────────────────────────────────────────────────────────
export const GRADE_THRESHOLDS = [
  { min: 9.0, max: 10, grade: 'A+', point: 4.0, label: 'Xuất sắc', color: '#16A34A' },
  { min: 8.5, max: 8.9, grade: 'A', point: 3.7, label: 'Giỏi', color: '#16A34A' },
  { min: 8.0, max: 8.4, grade: 'B+', point: 3.5, label: 'Khá giỏi', color: '#2D5D8A' },
  { min: 7.0, max: 7.9, grade: 'B', point: 3.0, label: 'Khá', color: '#2D5D8A' },
  { min: 6.5, max: 6.9, grade: 'C+', point: 2.5, label: 'Trung bình giỏi', color: '#E8A020' },
  { min: 5.5, max: 6.4, grade: 'C', point: 2.0, label: 'Trung bình', color: '#E8A020' },
  { min: 5.0, max: 5.4, grade: 'D+', point: 1.5, label: 'Trung bình yếu', color: '#DC2626' },
  { min: 4.0, max: 4.9, grade: 'D', point: 1.0, label: 'Yếu', color: '#DC2626' },
  { min: 0, max: 3.9, grade: 'F', point: 0, label: 'Kém', color: '#DC2626' },
];

// ─── Common date formats ──────────────────────────────────────────────────────
export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';
export const SHORT_DATE_FORMAT = 'dd/MM/yy';

// ─── Vietnamese currency ──────────────────────────────────────────────────────
export const CURRENCY_SYMBOL = '₫';
export const CURRENCY_LOCALE = 'vi-VN';
