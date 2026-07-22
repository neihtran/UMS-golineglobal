import React, { useState, useCallback, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  GraduationCap,
  BookOpen,
  Globe,
  FileText,
  DollarSign,
  ClipboardList,
  Building2,
  FlaskConical,
  Puzzle,
  BarChart3,
  Award,
  ScanSearch,
  Landmark,
  AlertTriangle,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  HelpCircle,
  Search,
  Briefcase,
  Calendar,
  Link,
} from 'lucide-react';
import { useAuth } from '@/app/providers';
import { ROLES, ROLE_LABELS } from '@/constants/modules';
import type { Role } from '@/constants/modules';

type Module = {
  id: string;
  label: string;
  route: string;
  icon: React.ReactNode;
  requiredRoles?: Role[];
};

type NavGroup = {
  id: string;
  label: string;
  groupIcon: React.ReactNode;
  modules: Module[];
};

// ─── DEV: SHOW ONLY SIS DEMO ───────────────────────────────────────────────────
const DEV_SIS_ONLY = true;
// ─────────────────────────────────────────────────────────────────────────────

const SIS_ONLY_MODULES: Module[] = [
  { id: 'sis-danh-muc', label: 'Danh mục đào tạo', route: '/sis/danh-muc', icon: <BookOpen className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
  { id: 'sis-tuyen-sinh', label: 'Sinh viên & Tuyển sinh', route: '/sis/tuyen-sinh', icon: <ClipboardList className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
  { id: 'sis-qua-trinh', label: 'Quá trình học tập', route: '/sis/qua-trinh', icon: <GraduationCap className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
  { id: 'sis-ctdt', label: 'CTĐT & Học phần', route: '/sis/ctdt', icon: <BookOpen className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
  { id: 'sis-dang-ky', label: 'ĐKHP & Thời khóa biểu', route: '/sis/dang-ky', icon: <Calendar className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
  { id: 'sis-diem', label: 'Điểm & Cảnh báo', route: '/sis/diem', icon: <Award className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
];

const SIS_ONLY_GROUP: NavGroup = {
  id: 'quan-ly-dao-tao',
  label: 'Quản lý Đào tạo',
  groupIcon: <GraduationCap className="h-4 w-4" />,
  modules: SIS_ONLY_MODULES,
};

// ─── NAV_GROUPS ───────────────────────────────────────────────────────────────
const NAV_GROUPS: NavGroup[] = DEV_SIS_ONLY
  ? [SIS_ONLY_GROUP]
  : [
  // ── NHÓM 1: QUẢN TRỊ HỆ THỐNG ──────────────────────────────────────────────
  {
    id: 'quan-tri-he-thong',
    label: 'Quản trị Hệ thống',
    groupIcon: <ShieldCheck className="h-4 w-4" />,
    modules: [
      // IAM
      { id: 'iam', label: 'IAM – Bảo mật & Tài khoản', route: '/iam', icon: <ShieldCheck className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
      { id: 'iam-tai-khoan', label: 'Tài khoản', route: '/iam/tai-khoan', icon: <Users className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
      { id: 'iam-vai-tro', label: 'Vai trò & Phân quyền', route: '/iam/vai-tro', icon: <ShieldCheck className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
      { id: 'iam-nhat-ky', label: 'Audit Log', route: '/iam/nhat-ky', icon: <FileText className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
      { id: 'iam-phien', label: 'Phiên đăng nhập', route: '/iam/phien-dang-nhap', icon: <LogOut className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
      { id: 'iam-api-keys', label: 'API Keys', route: '/iam/api-keys', icon: <Puzzle className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
      { id: 'iam-bao-mat', label: 'Cấu hình Bảo mật', route: '/iam/bao-mat', icon: <ShieldCheck className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
      { id: 'iam-mfa', label: 'Cấu hình MFA', route: '/iam/mfa', icon: <ShieldCheck className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
      // INT
      { id: 'int', label: 'INT – Tích hợp', route: '/int', icon: <Puzzle className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.HIEU_TRUONG] },
      { id: 'int-ds', label: 'DS Tích hợp', route: '/int/tich-hop', icon: <Puzzle className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
      { id: 'int-nhat-ky', label: 'Nhật ký API', route: '/int/nhat-ky', icon: <FileText className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
      // HRM
      { id: 'hrm', label: 'HRM – Nhân sự', route: '/hrm', icon: <Users className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA] },
      { id: 'hrm-don-vi', label: 'Đơn vị', route: '/hrm/don-vi', icon: <Building2 className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG] },
      { id: 'hrm-vien-chuc', label: 'Viên chức', route: '/hrm/vien-chuc', icon: <Users className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA] },
      { id: 'hrm-hop-dong', label: 'Hợp đồng', route: '/hrm/hop-dong', icon: <FileText className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG] },
      { id: 'hrm-luong', label: 'Bảng lương', route: '/hrm/luong', icon: <DollarSign className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG] },
      { id: 'hrm-nghi-phep', label: 'Nghỉ phép', route: '/hrm/nghi-phep', icon: <ClipboardList className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA] },
      { id: 'hrm-bo-nhiem', label: 'Bổ nhiệm', route: '/hrm/bo-nhiem', icon: <FileText className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.HIEU_TRUONG] },
      { id: 'hrm-tuyen-dung', label: 'Tuyển dụng', route: '/hrm/tuyen-dung', icon: <Users className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG] },
      { id: 'hrm-ky-luat', label: 'Kỷ luật', route: '/hrm/ky-luat', icon: <ShieldCheck className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.HIEU_TRUONG] },
      // PMS
      { id: 'pms', label: 'PMS – Công tác Đảng', route: '/pms', icon: <Landmark className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
      { id: 'pms-dv', label: 'Đảng viên', route: '/pms/dang-vien', icon: <Users className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
      { id: 'pms-bc', label: 'Báo cáo Đảng', route: '/pms/bao-cao', icon: <FileText className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
    ],
  },

  // ── NHÓM 2: QUẢN LÝ ĐÀO TẠO ───────────────────────────────────────────────
  {
    id: 'quan-ly-dao-tao',
    label: 'Quản lý Đào tạo',
    groupIcon: <GraduationCap className="h-4 w-4" />,
    modules: [
      // SIS
      { id: 'sis', label: 'SIS – Sinh viên & Đào tạo', route: '/sis', icon: <GraduationCap className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG] },
      { id: 'sis-sv', label: 'Danh sách Sinh viên', route: '/sis/sinh-vien', icon: <Users className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.PHO_HIEU_TRUONG] },
      { id: 'sis-ctdt', label: 'CTĐT', route: '/sis/ctdt', icon: <BookOpen className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.PHO_HIEU_TRUONG] },
      { id: 'sis-mon-hoc', label: 'Môn học', route: '/sis/mon-hoc', icon: <BookOpen className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.PHO_HIEU_TRUONG] },
      { id: 'sis-dk', label: 'Đăng ký HP', route: '/sis/dang-ky-hoc-phan', icon: <ClipboardList className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN, ROLES.TRUONG_KHOA] },
      { id: 'sis-ds-dk', label: 'DS Đăng ký', route: '/sis/dang-ky', icon: <ClipboardList className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.PHO_HIEU_TRUONG] },
      { id: 'sis-lop-hoc-phan', label: 'Lớp học phần', route: '/sis/lop-hoc-phan', icon: <BookOpen className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.GIAO_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG] },
      { id: 'sis-thoi-khoa-bieu', label: 'Thời khóa biểu', route: '/sis/thoi-khoa-bieu', icon: <Calendar className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.GIAO_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG] },
      { id: 'sis-thay-doi-lich-hoc', label: 'LS thay đổi lịch', route: '/sis/thay-doi-lich-hoc', icon: <Calendar className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG] },
      { id: 'sis-tn', label: 'Tốt nghiệp', route: '/sis/tot-nghiep', icon: <Award className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.PHO_HIEU_TRUONG] },
      { id: 'sis-thuc-tap', label: 'Thực tập TN', route: '/sis/thuc-tap', icon: <Briefcase className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.TRUONG_KHOA, ROLES.PHO_HIEU_TRUONG] },
      // SIS - Danh mục (Phase 1)
      { id: 'sis-nganh-hoc', label: 'Ngành học', route: '/sis/nganh-hoc', icon: <GraduationCap className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
      { id: 'sis-he-dao-tao', label: 'Hệ đào tạo', route: '/sis/he-dao-tao', icon: <GraduationCap className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
      { id: 'sis-chuyen-nganh', label: 'Chuyên ngành', route: '/sis/chuyen-nganh', icon: <GraduationCap className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
      { id: 'sis-hoc-ky', label: 'Học kỳ', route: '/sis/hoc-ky', icon: <ClipboardList className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
      { id: 'sis-lich-hoc', label: 'Lịch học', route: '/sis/lich-hoc', icon: <Calendar className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
      { id: 'sis-yeu-cau-sv', label: 'Yêu cầu SV', route: '/sis/yeu-cau-sv', icon: <ClipboardList className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
      { id: 'sis-tuyen-sinh', label: 'Tuyển sinh', route: '/sis/tuyen-sinh', icon: <ClipboardList className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
      { id: 'sis-loai-mon-hoc', label: 'Loại môn học', route: '/sis/loai-mon-hoc', icon: <BookOpen className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
      { id: 'sis-tien-quyet', label: 'Môn tiên quyết', route: '/sis/mon-tien-quyet', icon: <Link className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
      { id: 'sis-dieu-kien-hoc-phan', label: 'Điều kiện học phần', route: '/sis/dieu-kien-hoc-phan', icon: <ClipboardList className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
      // LMS
      { id: 'lms', label: 'LMS – Dạy học Số', route: '/lms', icon: <BookOpen className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN, ROLES.TRUONG_KHOA, ROLES.PHO_HIEU_TRUONG] },
      { id: 'lms-khoa-hoc', label: 'Khóa học', route: '/lms/khoa-hoc', icon: <BookOpen className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.TRUONG_KHOA, ROLES.PHO_HIEU_TRUONG] },
      { id: 'lms-bai-tap', label: 'Bài tập SV', route: '/lms/bai-tap-sinh-vien', icon: <ClipboardList className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.TRUONG_KHOA] },
      { id: 'lms-bai-tap-cua-toi', label: 'Bài tập của tôi', route: '/lms/bai-tap-cua-toi', icon: <ClipboardList className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN, ROLES.TRUONG_KHOA] },
      { id: 'lms-thu-vien', label: 'Thư viện học liệu', route: '/lms/thu-vien-hoc-lieu', icon: <BookOpen className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.TRUONG_KHOA] },
      { id: 'lms-bang-diem', label: 'Bảng điểm', route: '/lms/bang-diem', icon: <Award className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.TRUONG_KHOA, ROLES.PHO_HIEU_TRUONG] },
      // EXAM
      { id: 'exam', label: 'EXAM – Thi trực tuyến', route: '/exam', icon: <ClipboardList className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN, ROLES.TRUONG_KHOA, ROLES.PHO_HIEU_TRUONG] },
      { id: 'exam-ngan-hang', label: 'Ngân hàng câu hỏi', route: '/exam/ngan-hang-cau-hoi', icon: <BookOpen className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.TRUONG_KHOA] },
      { id: 'exam-ca-thi', label: 'Ca thi & Giám sát', route: '/exam/ca-thi', icon: <Users className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.TRUONG_KHOA, ROLES.PHO_HIEU_TRUONG] },
      { id: 'exam-tao-thi', label: 'Tạo đề thi', route: '/exam/tao-thi', icon: <ClipboardList className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.TRUONG_KHOA] },
      { id: 'exam-bang-diem', label: 'Bảng điểm', route: '/exam/bang-diem', icon: <Award className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN, ROLES.TRUONG_KHOA, ROLES.PHO_HIEU_TRUONG] },
      // PORTAL
      { id: 'portal', label: 'PORTAL – Cổng thông tin', route: '/portal', icon: <Globe className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA] },
      // LIB
      { id: 'lib', label: 'LIB – Thư viện', route: '/lib', icon: <BookOpen className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA] },
      { id: 'lib-tai-lieu', label: 'Tài liệu', route: '/lib/tai-lieu', icon: <BookOpen className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA] },
      { id: 'lib-tai-lieu-tao', label: 'Tạo tài liệu', route: '/lib/tai-lieu/tao', icon: <BookOpen className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
      { id: 'lib-muon-tra', label: 'Mượn trả', route: '/lib/muon-tra', icon: <ClipboardList className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN, ROLES.NHAN_VIEN] },
      { id: 'lib-tim-kiem', label: 'Tìm kiếm', route: '/lib/tim-kiem', icon: <Search className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA] },
      // DCE
      { id: 'dce', label: 'DCE – Năng lực Số', route: '/dce', icon: <Award className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA] },
      { id: 'dce-khoa', label: 'Khóa đào tạo', route: '/dce/khoa-dao-tao', icon: <BookOpen className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA] },
      { id: 'dce-chuan-dau-ra', label: 'Chuẩn đầu ra', route: '/dce/chuan-dau-ra', icon: <Award className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.SINH_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA] },
    ],
  },

  // ── NHÓM 3: QUẢN LÝ HÀNH CHÍNH ────────────────────────────────────────────
  {
    id: 'quan-ly-hanh-chinh',
    label: 'Quản lý Hành chính',
    groupIcon: <FileText className="h-4 w-4" />,
    modules: [
      // DMS
      { id: 'dms', label: 'DMS – Văn bản Điện tử', route: '/dms', icon: <FileText className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG] },
      { id: 'dms-ban-nhap', label: 'Bản nháp', route: '/dms/ban-nhap', icon: <FileText className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
      { id: 'dms-soan-thao', label: 'Soạn thảo', route: '/dms/soan-thao', icon: <FileText className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
      { id: 'dms-cho-ky', label: 'Chờ ký', route: '/dms/cho-ky', icon: <FileText className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG] },
      { id: 'dms-da-ky', label: 'Đã ký', route: '/dms/da-ky', icon: <FileText className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG] },
      { id: 'dms-phe-duyet', label: 'Phê duyệt', route: '/dms/phe-duyet', icon: <FileText className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG] },
      { id: 'dms-thong-ke', label: 'Thống kê', route: '/dms/thong-ke', icon: <BarChart3 className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.HIEU_TRUONG] },
      { id: 'dms-tra-cuu', label: 'Tra cứu', route: '/dms/tra-cuu', icon: <Search className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG] },
      // FIN
      { id: 'fin', label: 'FIN – Tài chính & Kế toán', route: '/fin', icon: <DollarSign className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG] },
      { id: 'fin-chi-tieu', label: 'Chi tiêu', route: '/fin/chi-tieu', icon: <DollarSign className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
      { id: 'fin-hoc-phi', label: 'Học phí', route: '/fin/hoc-phi', icon: <DollarSign className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG] },
      // WMS
      { id: 'wms', label: 'WMS – Giao việc', route: '/wms', icon: <ClipboardList className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN] },
      { id: 'wms-kanban', label: 'Kanban Board', route: '/wms/kanban', icon: <ClipboardList className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.TRUONG_KHOA, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN] },
      { id: 'wms-tao', label: 'Tạo công việc', route: '/wms/tao-cv', icon: <ClipboardList className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN] },
      { id: 'wms-cong-viec', label: 'Danh sách công việc', route: '/wms/cong-viec', icon: <ClipboardList className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.TRUONG_KHOA, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN] },
      // KTX
      { id: 'ktx', label: 'KTX – Ký túc xá', route: '/ktx', icon: <Building2 className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG] },
      { id: 'ktx-phong', label: 'Phòng & Cư dân', route: '/ktx/phong', icon: <Building2 className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
      { id: 'ktx-cu-dan', label: 'Cư dân KTX', route: '/ktx/sinh-vien', icon: <Users className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
      { id: 'ktx-dang-ky', label: 'Đăng ký', route: '/ktx/dang-ky', icon: <ClipboardList className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.GIAO_VIEN] },
      { id: 'ktx-thu-phi', label: 'Thu phí', route: '/ktx/thu-phi', icon: <DollarSign className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
      { id: 'ktx-su-co', label: 'Sự cố', route: '/ktx/su-co', icon: <AlertTriangle className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN] },
      { id: 'ktx-sinh-hoat', label: 'Sinh hoạt', route: '/ktx/sinh-hoat', icon: <Users className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.GIAO_VIEN] },
      // RIT
      { id: 'rit', label: 'RIT – NCKH & HTQT', route: '/rit', icon: <FlaskConical className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA] },
      { id: 'rit-de-tai', label: 'Đề tài NCKH', route: '/rit/de-tai', icon: <FlaskConical className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA] },
      { id: 'rit-ds-nckh', label: 'Danh sách NCKH', route: '/rit/danh-sach-nckh', icon: <FlaskConical className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA] },
      { id: 'rit-ncv', label: 'Nghiên cứu viên', route: '/rit/ncv', icon: <Users className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA] },
      { id: 'rit-hop-tac', label: 'Hợp tác quốc tế', route: '/rit/hop-tac', icon: <Globe className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA] },
      // BI
      { id: 'bi', label: 'BI – Phân tích Dữ liệu', route: '/bi', icon: <BarChart3 className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA] },
      { id: 'bi-bao-cao', label: 'Báo cáo', route: '/bi/bao-cao', icon: <BarChart3 className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA] },
      { id: 'bi-chi-so', label: 'Chỉ số KPIs', route: '/bi/chi-so', icon: <BarChart3 className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG, ROLES.TRUONG_KHOA] },
      // QA
      { id: 'qa', label: 'QA – Kiểm định Chất lượng', route: '/qa', icon: <Award className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG] },
      { id: 'qa-kiem-dinh', label: 'Kiểm định', route: '/qa/kiem-dinh', icon: <Award className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN, ROLES.HIEU_TRUONG, ROLES.PHO_HIEU_TRUONG] },
      { id: 'qa-khieu-nai', label: 'Khiếu nại', route: '/qa/khieu-nai', icon: <FileText className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN] },
      { id: 'qa-bao-cao', label: 'Báo cáo CL', route: '/qa/bao-cao', icon: <BarChart3 className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN] },
      { id: 'qa-tai-san', label: 'Quản lý Tài sản', route: '/qa/tai-san', icon: <BarChart3 className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN] },
      { id: 'qa-csvc', label: 'CSVC', route: '/qa/csvc', icon: <Building2 className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN, ROLES.GIAO_VIEN, ROLES.NHAN_VIEN] },
      // OCR
      { id: 'ocr', label: 'OCR – Số hóa Tài liệu', route: '/ocr', icon: <ScanSearch className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
      { id: 'ocr-danh-sach', label: 'Danh sách scan', route: '/ocr/danh-sach', icon: <ScanSearch className="h-4 w-4" />, requiredRoles: [ROLES.ADMIN] },
    ],
  },
];

// ─── Translation key map ───────────────────────────────────────────────────────
// Maps module/group id → nav namespace key
const NAV_KEYS: Record<string, string> = {
  'quan-tri-he-thong': 'group.systemAdmin',
  'quan-ly-dao-tao': 'group.trainingManagement',
  'quan-ly-hanh-chinh': 'group.adminManagement',
  iam: 'module.iam', 'iam-tai-khoan': 'module.iamAccount', 'iam-vai-tro': 'module.iamRole',
  'iam-nhat-ky': 'module.iamAuditLog', 'iam-phien': 'module.iamSession',
  'iam-api-keys': 'module.iamApiKeys', 'iam-bao-mat': 'module.iamSecurityConfig', 'iam-mfa': 'module.iamMfaConfig',
  wms: 'module.wms', 'wms-kanban': 'module.wmsKanban', 'wms-tao': 'module.wmsCreateTask', 'wms-cong-viec': 'module.wmsTaskList',
  hrm: 'module.hrm', 'hrm-don-vi': 'module.hrmDepartment', 'hrm-vien-chuc': 'module.hrmVienChuc',
  'hrm-hop-dong': 'module.hrmContract', 'hrm-luong': 'module.hrmSalary', 'hrm-nghi-phep': 'module.hrmLeave',
  'hrm-bo-nhiem': 'module.hrmAppointment', 'hrm-tuyen-dung': 'module.hrmRecruitment', 'hrm-ky-luat': 'module.hrmDiscipline',
  sis: 'module.sis', 'sis-sv': 'module.sisStudentList',
  'sis-danh-muc': 'module.sisTrainingCatalog', 'sis-tuyen-sinh': 'module.sisStudentAdmission',
  'sis-qua-trinh': 'module.sisStudyProcess', 'sis-ctdt': 'module.sisCurriculumProgram',
  'sis-dang-ky': 'module.sisRegistration', 'sis-diem': 'module.sisGradeWarning',
  'sis-dk': 'module.sisEnrollment', 'sis-ds-dk': 'module.sisEnrollmentList',
  'sis-tn': 'module.sisGraduation', 'sis-thuc-tap': 'module.sisInternship',
  lms: 'module.lms', 'lms-khoa-hoc': 'module.lmsCourse', 'lms-bai-tap': 'module.lmsAssignment',
  'lms-bai-tap-cua-toi': 'module.lmsMyAssignment', 'lms-thu-vien': 'module.lmsResource', 'lms-bang-diem': 'module.lmsGradebook',
  exam: 'module.exam', 'exam-ngan-hang': 'module.examQuestionBank', 'exam-ca-thi': 'module.examSession',
  'exam-tao-thi': 'module.examCreate', 'exam-bang-diem': 'module.examGradebook',
  portal: 'module.portal',
  dms: 'module.dms', 'dms-ban-nhap': 'module.dmsDraft', 'dms-soan-thao': 'module.dmsDrafting',
  'dms-cho-ky': 'module.dmsPending', 'dms-da-ky': 'module.dmsSigned', 'dms-phe-duyet': 'module.dmsApproval',
  'dms-thong-ke': 'module.dmsStats', 'dms-tra-cuu': 'module.dmsSearch',
  fin: 'module.fin', 'fin-chi-tieu': 'module.finExpenditure', 'fin-hoc-phi': 'module.finTuition',
  ktx: 'module.ktx', 'ktx-phong': 'module.ktxRoom', 'ktx-cu-dan': 'module.ktxResident',
  'ktx-dang-ky': 'module.ktxRegistration', 'ktx-thu-phi': 'module.ktxFee', 'ktx-su-co': 'module.ktxIncident', 'ktx-sinh-hoat': 'module.ktxActivity',
  rit: 'module.rit', 'rit-de-tai': 'module.ritProject', 'rit-ds-nckh': 'module.ritResearchList',
  'rit-ncv': 'module.ritResearcher', 'rit-hop-tac': 'module.ritInternational',
  bi: 'module.bi', 'bi-bao-cao': 'module.biReport', 'bi-chi-so': 'module.biKpi',
  qa: 'module.qa', 'qa-kiem-dinh': 'module.qaAccreditation', 'qa-khieu-nai': 'module.qaComplaint',
  'qa-bao-cao': 'module.qaReport', 'qa-tai-san': 'module.qaAsset', 'qa-csvc': 'module.qaFacility',
  dce: 'module.dce', 'dce-khoa': 'module.dceCourse', 'dce-chuan-dau-ra': 'module.dceOutcome',
  ocr: 'module.ocr', 'ocr-danh-sach': 'module.ocrList',
  int: 'module.int', 'int-ds': 'module.intList', 'int-nhat-ky': 'module.intLog',
  pms: 'module.pms', 'pms-dv': 'module.pmsMember', 'pms-bc': 'module.pmsReport',
  lib: 'module.lib', 'lib-tai-lieu': 'module.libDocument', 'lib-tai-lieu-tao': 'module.libCreateDoc',
  'lib-muon-tra': 'module.libLoan', 'lib-tim-kiem': 'module.libSearch',
};

// ─── Nav item ─────────────────────────────────────────────────────────────────
function NavItem({ module, collapsed, tNav }: { module: Module; collapsed: boolean; tNav: (key: string) => string }) {
  const location = useLocation();
  const isActive = module.route === '/dashboard'
    ? location.pathname === '/dashboard'
    : location.pathname.startsWith(module.route);
  const labelKey = NAV_KEYS[module.id];
  const label = labelKey ? tNav(labelKey) : module.label;

  return (
    <NavLink
      to={module.route}
      title={collapsed ? label : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={clsx(
        'group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
        'text-white/50 hover:bg-white/10 hover:text-white',
        isActive && 'bg-white/[0.14] text-white',
      )}
    >
      <span
        className={clsx(
          'shrink-0 transition-colors duration-150',
          isActive ? 'text-[rgb(var(--accent))]' : 'text-white/60',
        )}
      >
        {module.icon}
      </span>
      {!collapsed && (
        <span className="flex-1 truncate text-[12px] leading-tight">{label}</span>
      )}
      {isActive && (
        <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r bg-[rgb(var(--accent))]" />
      )}
    </NavLink>
  );
}

// ─── Collapsible group ───────────────────────────────────────────────────────
function NavGroupSection({
  group,
  collapsed,
  isOpen,
  onToggle,
  tNav,
}: {
  group: NavGroup;
  collapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
  tNav: (key: string) => string;
}) {
  const groupLabelKey = NAV_KEYS[group.id];
  const groupLabel = groupLabelKey ? tNav(groupLabelKey) : group.label;

  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        title={groupLabel}
        className={clsx(
          'group relative flex w-full items-center justify-center rounded-lg py-2 transition-all duration-150',
          'text-white/50 hover:bg-white/10 hover:text-white',
          isOpen && 'bg-white/[0.14] text-white',
        )}
      >
        <span className="shrink-0">{group.groupIcon}</span>
      </button>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 px-3 py-2">
        <button
          onClick={onToggle}
          title={isOpen ? tNav('module.collapse') : tNav('nav:expand')}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-white/40 hover:bg-white/10 hover:text-white transition-colors duration-150"
        >
          <ChevronDown className={clsx('h-3.5 w-3.5 transition-transform duration-200', isOpen ? 'rotate-0' : '-rotate-90')} />
        </button>
        <button
          onClick={onToggle}
          className="flex flex-1 items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors duration-150 text-white/40 hover:bg-white/5 hover:text-white/70"
        >
          <span className="shrink-0">{group.groupIcon}</span>
          <span className="flex-1 text-left">{groupLabel}</span>
        </button>
      </div>

      <div
        className={clsx(
          'overflow-hidden transition-all duration-250 ease-in-out',
          isOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="ml-2 pl-3 border-l border-white/10 space-y-0.5 py-1">
          {group.modules.map((m) => (
            <NavItem key={m.id} module={m} collapsed={collapsed} tNav={tNav} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();
  const { t } = useTranslation(['nav', 'common']);

  const tNav = (key: string) => t(key);

  const allGroupIds = NAV_GROUPS.map((g) => g.id);
  const defaultOpenGroups = new Set(allGroupIds);
  const [openGroups, setOpenGroups] = useState<Set<string>>(defaultOpenGroups);

  const toggleGroup = useCallback((id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const visibleGroups = useMemo(() => {
    return NAV_GROUPS.map((g) => ({
      ...g,
      modules: g.modules.filter(
        (m) => !m.requiredRoles || m.requiredRoles.some((r) => user?.role === r),
      ),
    })).filter((g) => g.modules.length > 0);
  }, [user?.role ?? null]);

  if (isLoading) return null;

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-full flex-col bg-[rgb(var(--bg-sidebar))] transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-4">
        {collapsed ? (
          <img
            src="/logo-pedagogy-icon.png"
            alt={t('nav:brandShort')}
            className="h-9 w-auto shrink-0 mx-auto"
          />
        ) : (
          <img
            src="/logo-pedagogy.png"
            alt={t('nav:brandFull')}
            className="h-11 w-auto shrink-0"
          />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {/* Dashboard link */}
        <NavLink
          to="/dashboard"
          className={clsx(
            'group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
            'text-white/50 hover:bg-white/10 hover:text-white',
            location.pathname === '/dashboard' && 'bg-white/[0.14] text-white',
          )}
        >
          <span
            className={clsx(
              'absolute left-0 top-1 bottom-1 w-0.5 rounded-r transition-colors',
              location.pathname === '/dashboard' ? 'bg-[rgb(var(--accent))]' : 'bg-transparent',
            )}
          />
          <span
            className={clsx('shrink-0 transition-colors', location.pathname === '/dashboard' ? 'text-[rgb(var(--accent))]' : 'text-white/60')}
          >
            <LayoutDashboard className="h-4 w-4" />
          </span>
          {!collapsed && <span className="text-[12px]">{t('nav:module.home')}</span>}
        </NavLink>

        {/* Divider */}
        {!collapsed && (
          <div className="my-2 border-t border-white/10" />
        )}

        {/* Groups */}
        {visibleGroups.map((group) => (
          <NavGroupSection
            key={group.id}
            group={group}
            collapsed={collapsed}
            isOpen={openGroups.has(group.id)}
            onToggle={() => toggleGroup(group.id)}
            tNav={tNav}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/10 space-y-0.5 px-2 py-2">
        <button
          title={collapsed ? t('nav:module.support') : undefined}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors duration-150"
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-[12px]">{t('nav:module.support')}</span>}
        </button>

        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 group hover:bg-white/10 transition-colors cursor-default">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white ring-2 ring-white/20">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-[12px] font-semibold text-white leading-tight">{user?.name}</p>
              <p className="truncate text-[10px] text-white/40 leading-tight">
                {user?.role ? ROLE_LABELS[user.role as Role] : ''}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              title={t('nav:module.logout')}
              className="shrink-0 rounded p-1 text-white/30 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={onToggle}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors duration-150"
          aria-label={collapsed ? t('nav:module.expand') : t('nav:module.collapse')}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4 shrink-0" />
              <span className="text-[12px]">{t('nav:module.collapse')}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
