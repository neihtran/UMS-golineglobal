/**
 * Seed script — SIS (Sinh viên & Đào tạo) data
 * Run: npm run seed:sis
 *
 * Requires: seedDepartments() already run.
 * Password for all seed accounts: Password@123
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { hashPassword } from '../utils/password.js';
import { User, Department, Student, Subject, Enrollment, Curriculum, Internship, GraduationSession, GraduationRecord } from '../models/index.js';
import { logger } from '../utils/logger.js';

config();

const DEPT_IDS: Record<string, string> = {
  KHOA_CNTT: 'DEPT_CNTT_ID',
  KHOA_KINHTE: 'DEPT_KINHTE_ID',
  KHOA_LUAT: 'DEPT_LUAT_ID',
  KHOA_NN: 'DEPT_NN_ID',
  KHOA_KHXD: 'DEPT_KHXD_ID',
  KHOA_DIENTU: 'DEPT_DIENTU_ID',
  KHOA_COKHI: 'DEPT_COKHI_ID',
  KHOA_MOITRUONG: 'DEPT_MOITRUONG_ID',
  P_TOCHUC: 'DEPT_TOCHUC_ID',
  P_DAOTAO: 'DEPT_DAOTAO_ID',
  P_TAICHINH: 'DEPT_TAICHINH_ID',
  P_KHCN: 'DEPT_KHCN_ID',
  P_HCQT: 'DEPT_HCQT_ID',
  P_KHTH: 'DEPT_KHTH_ID',
  P_CTSV: 'DEPT_CTSV_ID',
  P_QHMT: 'DEPT_QHMT_ID',
  TT_TTTN: 'DEPT_TTTN_ID',
  TT_THTT: 'DEPT_THTT_ID',
  TT_THUDIEN: 'DEPT_THUDIEN_ID',
  TT_DLVN: 'DEPT_DLVN_ID',
  VIEN_NCKH: 'DEPT_NCKH_ID',
  BAN_THANHTra: 'DEPT_TTGS_ID',
  BAN_CTDLSV: 'DEPT_CTDLSV_ID',
};

// ─── Students (50 records) ──────────────────────────────────────────────────────
const STUDENTS: Array<Record<string, unknown>> = [
  { studentId: 'SV-2020-0001', name: 'Nguyễn Văn An', gender: 'Nam', deptCode: 'KHOA_CNTT', className: 'CNTT2020A', educationLevel: 'ĐH', admissionDate: '2020-09-01', status: 'graduated', gpa: 8.2, creditsEarned: 135, creditsRequired: 135 },
  { studentId: 'SV-2020-0002', name: 'Trần Thị Bình', gender: 'Nữ', deptCode: 'KHOA_KINHTE', className: 'KT2020A', educationLevel: 'ĐH', admissionDate: '2020-09-01', status: 'studying', gpa: 7.8, creditsEarned: 90, creditsRequired: 135 },
  { studentId: 'SV-2020-0003', name: 'Lê Hoàng Cường', gender: 'Nam', deptCode: 'KHOA_CNTT', className: 'CNTT2020A', educationLevel: 'ĐH', admissionDate: '2020-09-01', status: 'studying', gpa: 6.5, creditsEarned: 85, creditsRequired: 135 },
  { studentId: 'SV-2020-0004', name: 'Phạm Thị Dung', gender: 'Nữ', deptCode: 'KHOA_NN', className: 'NN2020A', educationLevel: 'ĐH', admissionDate: '2020-09-01', status: 'graduated', gpa: 8.9, creditsEarned: 140, creditsRequired: 140 },
  { studentId: 'SV-2020-0005', name: 'Hoàng Văn Em', gender: 'Nam', deptCode: 'KHOA_LUAT', className: 'Luật2020A', educationLevel: 'ĐH', admissionDate: '2020-09-01', status: 'suspended', gpa: 5.2, creditsEarned: 60, creditsRequired: 135 },
  { studentId: 'SV-2020-0006', name: 'Đặng Thị Phương', gender: 'Nữ', deptCode: 'KHOA_CNTT', className: 'CNTT2020B', educationLevel: 'ĐH', admissionDate: '2020-09-01', status: 'studying', gpa: 7.5, creditsEarned: 100, creditsRequired: 135 },
  { studentId: 'SV-2020-0007', name: 'Bùi Văn Giang', gender: 'Nam', deptCode: 'KHOA_DIENTU', className: 'ĐT2020A', educationLevel: 'ĐH', admissionDate: '2020-09-01', status: 'graduated', gpa: 7.0, creditsEarned: 135, creditsRequired: 135 },
  { studentId: 'SV-2020-0008', name: 'Ngô Thị Hương', gender: 'Nữ', deptCode: 'KHOA_KINHTE', className: 'KT2020B', educationLevel: 'ĐH', admissionDate: '2020-09-01', status: 'studying', gpa: 8.5, creditsEarned: 95, creditsRequired: 135 },
  { studentId: 'SV-2021-0009', name: 'Vũ Văn Ích', gender: 'Nam', deptCode: 'KHOA_CNTT', className: 'CNTT2021A', educationLevel: 'ĐH', admissionDate: '2021-09-01', status: 'studying', gpa: 6.8, creditsEarned: 75, creditsRequired: 135 },
  { studentId: 'SV-2021-0010', name: 'Lý Thị Kim', gender: 'Nữ', deptCode: 'KHOA_NN', className: 'NN2021A', educationLevel: 'ĐH', admissionDate: '2021-09-01', status: 'studying', gpa: 9.0, creditsEarned: 80, creditsRequired: 135 },
  { studentId: 'SV-2021-0011', name: 'Trần Văn Lâm', gender: 'Nam', deptCode: 'KHOA_KHXD', className: 'KTXD2021A', educationLevel: 'ĐH', admissionDate: '2021-09-01', status: 'studying', gpa: 7.2, creditsEarned: 70, creditsRequired: 135 },
  { studentId: 'SV-2021-0012', name: 'Nguyễn Thị Mai', gender: 'Nữ', deptCode: 'KHOA_LUAT', className: 'Luật2021A', educationLevel: 'ĐH', admissionDate: '2021-09-01', status: 'studying', gpa: 8.3, creditsEarned: 78, creditsRequired: 135 },
  { studentId: 'SV-2021-0013', name: 'Phan Văn Nam', gender: 'Nam', deptCode: 'KHOA_CNTT', className: 'CNTT2021B', educationLevel: 'CĐ', admissionDate: '2021-09-01', status: 'studying', gpa: 7.0, creditsEarned: 55, creditsRequired: 90 },
  { studentId: 'SV-2021-0014', name: 'Đỗ Thị Oanh', gender: 'Nữ', deptCode: 'KHOA_COKHI', className: 'CK2021A', educationLevel: 'ĐH', admissionDate: '2021-09-01', status: 'dropped', gpa: 4.5, creditsEarned: 30, creditsRequired: 135 },
  { studentId: 'SV-2021-0015', name: 'Nguyễn Văn Phúc', gender: 'Nam', deptCode: 'KHOA_MOITRUONG', className: 'MT2021A', educationLevel: 'ĐH', admissionDate: '2021-09-01', status: 'studying', gpa: 6.9, creditsEarned: 72, creditsRequired: 135 },
  { studentId: 'SV-2022-0016', name: 'Trần Thị Quỳnh', gender: 'Nữ', deptCode: 'KHOA_CNTT', className: 'CNTT2022A', educationLevel: 'ĐH', admissionDate: '2022-09-01', status: 'studying', gpa: 8.7, creditsEarned: 60, creditsRequired: 135 },
  { studentId: 'SV-2022-0017', name: 'Lê Văn Rồi', gender: 'Nam', deptCode: 'KHOA_KINHTE', className: 'KT2022A', educationLevel: 'ĐH', admissionDate: '2022-09-01', status: 'studying', gpa: 7.4, creditsEarned: 55, creditsRequired: 135 },
  { studentId: 'SV-2022-0018', name: 'Phạm Thị Sương', gender: 'Nữ', deptCode: 'KHOA_NN', className: 'NN2022A', educationLevel: 'CQ', admissionDate: '2022-09-01', status: 'studying', gpa: 8.1, creditsEarned: 45, creditsRequired: 120 },
  { studentId: 'SV-2022-0019', name: 'Hoàng Văn Tùng', gender: 'Nam', deptCode: 'KHOA_DIENTU', className: 'ĐT2022A', educationLevel: 'ĐH', admissionDate: '2022-09-01', status: 'studying', gpa: 6.3, creditsEarned: 50, creditsRequired: 135 },
  { studentId: 'SV-2022-0020', name: 'Đặng Thị Uyên', gender: 'Nữ', deptCode: 'KHOA_CNTT', className: 'CNTT2022B', educationLevel: 'ĐH', admissionDate: '2022-09-01', status: 'studying', gpa: 7.9, creditsEarned: 58, creditsRequired: 135 },
  { studentId: 'SV-2022-0021', name: 'Nguyễn Văn Vinh', gender: 'Nam', deptCode: 'KHOA_LUAT', className: 'Luật2022A', educationLevel: 'ĐH', admissionDate: '2022-09-01', status: 'studying', gpa: 7.6, creditsEarned: 52, creditsRequired: 135 },
  { studentId: 'SV-2023-0022', name: 'Trần Thị Xuân', gender: 'Nữ', deptCode: 'KHOA_CNTT', className: 'CNTT2023A', educationLevel: 'ĐH', admissionDate: '2023-09-01', status: 'studying', gpa: 8.4, creditsEarned: 40, creditsRequired: 135 },
  { studentId: 'SV-2023-0023', name: 'Lê Hoàng Yến', gender: 'Nữ', deptCode: 'KHOA_KINHTE', className: 'KT2023A', educationLevel: 'ĐH', admissionDate: '2023-09-01', status: 'studying', gpa: 7.1, creditsEarned: 38, creditsRequired: 135 },
  { studentId: 'SV-2023-0024', name: 'Phạm Văn Zũ', gender: 'Nam', deptCode: 'KHOA_KHXD', className: 'KTXD2023A', educationLevel: 'ĐH', admissionDate: '2023-09-01', status: 'studying', gpa: 6.7, creditsEarned: 35, creditsRequired: 135 },
  { studentId: 'SV-2023-0025', name: 'Hoàng Thị Ánh', gender: 'Nữ', deptCode: 'KHOA_NN', className: 'NN2023A', educationLevel: 'TC', admissionDate: '2023-09-01', status: 'studying', gpa: 8.0, creditsEarned: 30, creditsRequired: 90 },
  { studentId: 'SV-2023-0026', name: 'Đỗ Văn Bảo', gender: 'Nam', deptCode: 'KHOA_DIENTU', className: 'ĐT2023A', educationLevel: 'ĐH', admissionDate: '2023-09-01', status: 'transferred', gpa: 7.0, creditsEarned: 20, creditsRequired: 135 },
  { studentId: 'SV-2024-0027', name: 'Nguyễn Thị Chi', gender: 'Nữ', deptCode: 'KHOA_CNTT', className: 'CNTT2024A', educationLevel: 'ĐH', admissionDate: '2024-09-01', status: 'studying', gpa: 9.1, creditsEarned: 15, creditsRequired: 135 },
  { studentId: 'SV-2024-0028', name: 'Trần Văn Dũng', gender: 'Nam', deptCode: 'KHOA_KINHTE', className: 'KT2024A', educationLevel: 'ĐH', admissionDate: '2024-09-01', status: 'studying', gpa: 7.8, creditsEarned: 12, creditsRequired: 135 },
  { studentId: 'SV-2024-0029', name: 'Lê Thị Em', gender: 'Nữ', deptCode: 'KHOA_LUAT', className: 'Luật2024A', educationLevel: 'ĐH', admissionDate: '2024-09-01', status: 'studying', gpa: 8.5, creditsEarned: 10, creditsRequired: 135 },
  { studentId: 'SV-2024-0030', name: 'Phan Văn Phong', gender: 'Nam', deptCode: 'KHOA_NN', className: 'NN2024A', educationLevel: 'ĐH', admissionDate: '2024-09-01', status: 'studying', gpa: 7.3, creditsEarned: 8, creditsRequired: 135 },
];

const DEPT_NAME_MAP: Record<string, string> = {
  KHOA_CNTT: 'Khoa Công nghệ Thông tin',
  KHOA_KINHTE: 'Khoa Kinh tế & Quản trị',
  KHOA_LUAT: 'Khoa Luật',
  KHOA_NN: 'Khoa Ngoại ngữ',
  KHOA_KHXD: 'Khoa Kỹ thuật Xây dựng',
  KHOA_DIENTU: 'Khoa Điện — Điện tử',
  KHOA_COKHI: 'Khoa Cơ khí',
  KHOA_MOITRUONG: 'Khoa Môi trường',
};

// ─── Subjects (30 records) ─────────────────────────────────────────────────────
const SUBJECTS: Array<Record<string, unknown>> = [
  { code: 'MH-CNTT-101', name: 'Cấu trúc Dữ liệu & Giải thuật', credits: 3, theoryHours: 30, practiceHours: 30, department: 'KHOA_CNTT' },
  { code: 'MH-CNTT-102', name: 'Lập trình Hướng đối tượng', credits: 3, theoryHours: 30, practiceHours: 30, department: 'KHOA_CNTT' },
  { code: 'MH-CNTT-201', name: 'Cơ sở Dữ liệu', credits: 3, theoryHours: 30, practiceHours: 30, department: 'KHOA_CNTT' },
  { code: 'MH-CNTT-202', name: 'Mạng Máy tính', credits: 3, theoryHours: 30, practiceHours: 15, department: 'KHOA_CNTT' },
  { code: 'MH-CNTT-301', name: 'Trí tuệ Nhân tạo', credits: 3, theoryHours: 30, practiceHours: 30, department: 'KHOA_CNTT' },
  { code: 'MH-CNTT-302', name: 'Phát triển Ứng dụng Web', credits: 3, theoryHours: 20, practiceHours: 40, department: 'KHOA_CNTT' },
  { code: 'MH-CNTT-303', name: 'Bảo mật Thông tin', credits: 3, theoryHours: 30, practiceHours: 15, department: 'KHOA_CNTT' },
  { code: 'MH-CNTT-401', name: 'Đồ án Tốt nghiệp', credits: 6, theoryHours: 0, practiceHours: 120, department: 'KHOA_CNTT' },
  { code: 'MH-KT-101', name: 'Kinh tế Vi mô', credits: 3, theoryHours: 45, practiceHours: 0, department: 'KHOA_KINHTE' },
  { code: 'MH-KT-102', name: 'Kinh tế Vĩ mô', credits: 3, theoryHours: 45, practiceHours: 0, department: 'KHOA_KINHTE' },
  { code: 'MH-KT-201', name: 'Kế toán Tài chính', credits: 3, theoryHours: 40, practiceHours: 10, department: 'KHOA_KINHTE' },
  { code: 'MH-KT-202', name: 'Quản trị Doanh nghiệp', credits: 3, theoryHours: 45, practiceHours: 0, department: 'KHOA_KINHTE' },
  { code: 'MH-LUAT-101', name: 'Luật Hiến pháp', credits: 2, theoryHours: 30, practiceHours: 0, department: 'KHOA_LUAT' },
  { code: 'MH-LUAT-201', name: 'Luật Dân sự', credits: 3, theoryHours: 45, practiceHours: 0, department: 'KHOA_LUAT' },
  { code: 'MH-NN-101', name: 'Tiếng Anh 1', credits: 2, theoryHours: 30, practiceHours: 30, department: 'KHOA_NN' },
  { code: 'MH-NN-102', name: 'Tiếng Anh 2', credits: 2, theoryHours: 30, practiceHours: 30, department: 'KHOA_NN' },
  { code: 'MH-NN-201', name: 'Tiếng Anh chuyên ngành', credits: 3, theoryHours: 30, practiceHours: 30, department: 'KHOA_NN' },
  { code: 'MH-NN-301', name: 'Phiên dịch Nghề nghiệp', credits: 3, theoryHours: 20, practiceHours: 40, department: 'KHOA_NN' },
  { code: 'MH-KHXD-101', name: 'Cơ học Vật liệu', credits: 3, theoryHours: 45, practiceHours: 0, department: 'KHOA_KHXD' },
  { code: 'MH-KHXD-201', name: 'Kết cấu Thép', credits: 3, theoryHours: 40, practiceHours: 10, department: 'KHOA_KHXD' },
  { code: 'MH-DT-101', name: 'Mạch Điện tử Cơ bản', credits: 3, theoryHours: 30, practiceHours: 30, department: 'KHOA_DIENTU' },
  { code: 'MH-DT-201', name: 'Vi xử lý & Vi điều khiển', credits: 3, theoryHours: 30, practiceHours: 30, department: 'KHOA_DIENTU' },
  { code: 'MH-MT-101', name: 'Môi trường & Phát triển Bền vững', credits: 2, theoryHours: 30, practiceHours: 0, department: 'KHOA_MOITRUONG' },
  { code: 'MH-CK-101', name: 'Cơ sở Chế tạo máy', credits: 3, theoryHours: 30, practiceHours: 30, department: 'KHOA_COKHI' },
  { code: 'MH-CNTT-601', name: 'Kiểm thử Phần mềm', credits: 2, theoryHours: 20, practiceHours: 20, department: 'KHOA_CNTT' },
  { code: 'MH-CNTT-602', name: 'Quản trị Dự án CNTT', credits: 3, theoryHours: 30, practiceHours: 15, department: 'KHOA_CNTT' },
  { code: 'MH-CNTT-603', name: 'Khoa học Dữ liệu', credits: 3, theoryHours: 30, practiceHours: 30, department: 'KHOA_CNTT' },
  { code: 'MH-CNTT-701', name: 'An ninh Mạng', credits: 3, theoryHours: 30, practiceHours: 15, department: 'KHOA_CNTT' },
  { code: 'MH-CNTT-702', name: 'Cloud Computing', credits: 3, theoryHours: 20, practiceHours: 40, department: 'KHOA_CNTT' },
  { code: 'MH-THOC-101', name: 'Tin học Văn phòng', credits: 2, theoryHours: 15, practiceHours: 30, department: 'KHOA_CNTT' },
];

// ─── Curricula (5 records) ─────────────────────────────────────────────────────
const CURRICULA: Array<Record<string, unknown>> = [
  { name: 'Chương trình ĐH CNTT 2020', code: 'CT-CNTT-2020', educationLevel: 'ĐH', department: 'KHOA_CNTT', totalCredits: 135, durationYears: 4, startYear: 2020, status: 'active' },
  { name: 'Chương trình ĐH Kinh tế 2020', code: 'CT-KT-2020', educationLevel: 'ĐH', department: 'KHOA_KINHTE', totalCredits: 135, durationYears: 4, startYear: 2020, status: 'active' },
  { name: 'Chương trình CĐ CNTT 2022', code: 'CT-CNTT-CD-2022', educationLevel: 'CĐ', department: 'KHOA_CNTT', totalCredits: 90, durationYears: 3, startYear: 2022, status: 'active' },
  { name: 'Chương trình CQ NN 2020', code: 'CT-NN-CQ-2020', educationLevel: 'CQ', department: 'KHOA_NN', totalCredits: 120, durationYears: 4, startYear: 2020, status: 'active' },
  { name: 'Chương trình ĐH Luật 2021', code: 'CT-LUAT-2021', educationLevel: 'ĐH', department: 'KHOA_LUAT', totalCredits: 135, durationYears: 4, startYear: 2021, status: 'archived' },
];

// ─── Internships (20 records) ──────────────────────────────────────────────────
const INTERNSHIPS: Array<Record<string, unknown>> = [
  { studentId: 'SV-2020-0001', companyName: 'FPT Software', position: 'Software Engineer Intern', startDate: '2023-06-01', endDate: '2023-09-01', status: 'completed', grade: 9.0 },
  { studentId: 'SV-2020-0002', companyName: 'VPBank', position: 'Business Analyst Intern', startDate: '2023-06-01', endDate: '2023-09-01', status: 'completed', grade: 8.5 },
  { studentId: 'SV-2020-0003', companyName: 'Viettel', position: 'Network Engineer Intern', startDate: '2023-06-01', endDate: '2023-09-01', status: 'completed', grade: 7.5 },
  { studentId: 'SV-2020-0006', companyName: 'MoMo', position: 'Backend Developer Intern', startDate: '2023-06-15', endDate: '2023-10-15', status: 'completed', grade: 8.8 },
  { studentId: 'SV-2020-0007', companyName: 'Samsung Vietnam', position: 'Embedded Engineer Intern', startDate: '2023-05-01', endDate: '2023-08-01', status: 'completed', grade: 8.0 },
  { studentId: 'SV-2021-0009', companyName: 'Grab Vietnam', position: 'Mobile Dev Intern', startDate: '2024-06-01', endDate: '2024-09-01', status: 'completed', grade: 7.2 },
  { studentId: 'SV-2021-0010', companyName: 'British Council', position: 'Teaching Assistant', startDate: '2024-06-01', endDate: '2024-09-01', status: 'completed', grade: 9.2 },
  { studentId: 'SV-2021-0011', companyName: 'Coteccons', position: 'Civil Engineering Intern', startDate: '2024-05-15', endDate: '2024-08-15', status: 'completed', grade: 7.8 },
  { studentId: 'SV-2021-0012', companyName: 'Baker McKenzie', position: 'Legal Intern', startDate: '2024-06-01', endDate: '2024-09-01', status: 'completed', grade: 8.5 },
  { studentId: 'SV-2022-0016', companyName: 'Shopee', position: 'Data Science Intern', startDate: '2025-06-01', endDate: '2025-09-01', status: 'in_progress', grade: 8.5 },
  { studentId: 'SV-2022-0017', companyName: 'Unilever', position: 'Marketing Intern', startDate: '2025-06-01', endDate: '2025-09-01', status: 'in_progress', grade: 8.0 },
  { studentId: 'SV-2022-0018', companyName: 'VNU-IS', position: 'English Teaching Intern', startDate: '2025-06-15', endDate: '2025-09-15', status: 'in_progress', grade: 9.0 },
  { studentId: 'SV-2022-0019', companyName: 'Panasonic', position: 'Hardware Engineer Intern', startDate: '2025-06-01', endDate: '2025-09-01', status: 'in_progress', grade: 7.5 },
  { studentId: 'SV-2023-0022', companyName: 'Google Vietnam', position: 'SWE Intern', startDate: '2026-05-01', endDate: '2026-08-01', status: 'registered', grade: undefined },
  { studentId: 'SV-2023-0023', companyName: 'Deloitte Vietnam', position: 'Audit Intern', startDate: '2026-06-01', endDate: '2026-09-01', status: 'registered', grade: undefined },
  { studentId: 'SV-2021-0013', companyName: 'CMC Corp', position: 'IT Support Intern', startDate: '2022-06-01', endDate: '2022-08-01', status: 'completed', grade: 7.0 },
  { studentId: 'SV-2020-0001', companyName: 'Microsoft Vietnam', position: 'Cloud Intern', startDate: '2022-06-01', endDate: '2022-09-01', status: 'completed', grade: 9.5 },
  { studentId: 'SV-2020-0004', companyName: 'Vinschool', position: 'English Teacher Intern', startDate: '2022-05-01', endDate: '2022-08-01', status: 'completed', grade: 9.0 },
  { studentId: 'SV-2021-0015', companyName: 'Vingroup', position: 'Environmental Analyst Intern', startDate: '2023-06-01', endDate: '2023-09-01', status: 'completed', grade: 7.5 },
  { studentId: 'SV-2020-0008', companyName: 'ACB Bank', position: 'Finance Intern', startDate: '2022-06-01', endDate: '2022-09-01', status: 'completed', grade: 8.2 },
];

// ─── Graduation Sessions (3 records) ──────────────────────────────────────────
const GRADUATION_SESSIONS: Array<Record<string, unknown>> = [
  { name: 'Tốt nghiệp Đợt 1 - 2024', academicYear: '2023-2024', semester: '2', status: 'closed', openDate: '2024-06-01', closeDate: '2024-06-30', decisionNumber: '1121/QĐ-CT', decisionDate: '2024-06-25' },
  { name: 'Tốt nghiệp Đợt 1 - 2025', academicYear: '2024-2025', semester: '2', status: 'closed', openDate: '2025-06-01', closeDate: '2025-06-30', decisionNumber: '0987/QĐ-CT', decisionDate: '2025-06-28' },
  { name: 'Tốt nghiệp Đợt 1 - 2026', academicYear: '2025-2026', semester: '2', status: 'open', openDate: '2026-06-01', closeDate: '2026-07-15' },
];

export async function seedSis() {
  await Promise.all([Student.deleteMany({}), Subject.deleteMany({}), Enrollment.deleteMany({}), Curriculum.deleteMany({}), Internship.deleteMany({}), GraduationSession.deleteMany({}), GraduationRecord.deleteMany({})]);
  logger.info('Cleared existing SIS data');

  const departments = await Department.find({});
  const deptMap = new Map(departments.map(d => [d.code, d._id.toString()]));

  // ─── 1. Seed Subjects ─────────────────────────────────────────────────────────
  const createdSubjects = await Subject.insertMany(SUBJECTS.map(s => ({
    ...s,
    department: deptMap.get(s.department as string),
    isActive: true,
  })));
  logger.info(`✅ Seeded ${createdSubjects.length} subjects`);

  // ─── 2. Seed Students ─────────────────────────────────────────────────────────
  const passwordHash = await hashPassword('Password@123');
  const createdStudents = await Student.insertMany(STUDENTS.map(s => {
    const deptId = deptMap.get(s.deptCode as string);
    return {
      studentId: s.studentId,
      name: s.name as string,
      gender: s.gender as string,
      department: deptId,
      className: s.className as string,
      educationLevel: s.educationLevel as string,
      admissionDate: new Date(s.admissionDate as string),
      expectedGradDate: new Date((s.admissionDate as string).replace('2020', '2024').replace('2021', '2025').replace('2022', '2026').replace('2023', '2027').replace('2024', '2028')),
      status: s.status as string,
      gpa: s.gpa as number | undefined,
      creditsEarned: s.creditsEarned as number,
      creditsRequired: s.creditsRequired as number,
      email: `${(s.studentId as string).toLowerCase()}@sinhvien.truong.edu.vn`,
      phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
      address: `${Math.floor(1 + Math.random() * 999)} Nguyễn Văn Linh, Q.7, TP.HCM`,
      ethnicity: 'Kinh',
      emergencyContact: { name: `${(s.name as string)} - Phụ huynh`, phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`, relationship: 'Bố/Mẹ' },
    };
  }));
  logger.info(`✅ Seeded ${createdStudents.length} students`);

  // ─── 3. Seed Curricula ────────────────────────────────────────────────────────
  const createdCurricula = await Curriculum.insertMany(CURRICULA.map(c => ({
    ...c,
    department: deptMap.get((c.department as string) || ''),
    description: '',
  })));
  logger.info(`✅ Seeded ${createdCurricula.length} curricula`);

  // ─── 4. Seed Internships ──────────────────────────────────────────────────────
  const createdInternships = await Internship.insertMany(INTERNSHIPS);
  logger.info(`✅ Seeded ${createdInternships.length} internships`);

  // ─── 5. Seed Graduation Sessions ─────────────────────────────────────────────
  const createdSessions = await GraduationSession.insertMany(GRADUATION_SESSIONS);
  logger.info(`✅ Seeded ${createdSessions.length} graduation sessions`);

  // ─── 6. Seed Graduation Records (from graduated students) ────────────────────
  const graduatedStudents = createdStudents.filter(s => s.status === 'graduated');
  const session2024 = createdSessions.find(s => s.academicYear === '2023-2024')!;
  const session2025 = createdSessions.find(s => s.academicYear === '2024-2025')!;

  const graduationRecords = graduatedStudents.map((s, i) => {
    const session = i < 2 ? session2024 : session2025;
    return {
      studentId: s.studentId,
      studentName: s.name,
      graduationSessionId: session._id,
      degree: i % 2 === 0 ? 'Cử nhân' : 'Kỹ sư',
      classification: i < 2 ? 'Giỏi' : i < 4 ? 'Khá' : 'Trung bình',
      gpa: s.gpa ?? 7.0,
    };
  });

  const createdRecords = await GraduationRecord.insertMany(graduationRecords);
  logger.info(`✅ Seeded ${createdRecords.length} graduation records`);

  // ─── 7. Seed Enrollments ──────────────────────────────────────────────────────
  const subjectMap = new Map(createdSubjects.map(s => [s.code, s._id.toString()]));
  const studentIdMap = new Map(createdStudents.map(s => [s.studentId, s._id.toString()]));
  const enrollments: Array<Record<string, unknown>> = [];

  for (const student of createdStudents) {
    const subjCodes = Array.from(subjectMap.keys()).slice(0, 8 + Math.floor(Math.random() * 5));
    for (const code of subjCodes) {
      const subjId = subjectMap.get(code);
      if (!subjId) continue;
      const statuses: Array<string> = student.status === 'graduated' ? ['completed'] : ['studying', 'completed'];
      enrollments.push({
        studentId: student._id,
        subjectId: subjId,
        semester: '2',
        academicYear: '2024-2025',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        scoreFormative: Math.round((Math.random() * 3 + 5) * 10) / 10,
        scoreMidterm: Math.round((Math.random() * 4 + 4) * 10) / 10,
        scoreFinal: Math.round((Math.random() * 4 + 4) * 10) / 10,
        grade: Math.random() > 0.3 ? ['A', 'B+', 'B', 'C+', 'B', 'B+'][Math.floor(Math.random() * 6)] : undefined,
      });
    }
  }

  const createdEnrollments = await Enrollment.insertMany(enrollments.slice(0, 200));
  logger.info(`✅ Seeded ${createdEnrollments.length} enrollments`);

  // ─── 8. Seed Student User Accounts ───────────────────────────────────────────
  const studentUsers = createdStudents.slice(0, 15).map(s => ({
    email: s.email ?? `${(s.studentId as string).toLowerCase()}@sinhvien.truong.edu.vn`,
    username: (s.studentId as string).toLowerCase(),
    password: passwordHash,
    displayName: s.name,
    role: 'SINH_VIEN',
    status: 'active',
    mfaEnabled: 'disabled',
    permissions: ['sis:read'],
  }));

  if (studentUsers.length > 0) {
    await User.insertMany(studentUsers);
    logger.info(`✅ Seeded ${studentUsers.length} student user accounts`);
  }

  console.log('\n✅ SIS seed complete!');
  console.log(`   Students: ${createdStudents.length}`);
  console.log(`   Subjects: ${createdSubjects.length}`);
  console.log(`   Enrollments: ${createdEnrollments.length}`);
  console.log(`   Curricula: ${createdCurricula.length}`);
  console.log(`   Internships: ${createdInternships.length}`);
  console.log(`   Graduation sessions: ${createdSessions.length}`);
  console.log(`   Graduation records: ${createdRecords.length}`);
}

// Run directly when executed as script
const isMain = process.argv[1]?.endsWith('seedSis.ts') || process.argv[1]?.endsWith('seedSis.js');
if (isMain) {
  (async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/ums_db');
      await seedSis();
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      console.error('❌ SIS seed failed:', e);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    }
  })();
}
