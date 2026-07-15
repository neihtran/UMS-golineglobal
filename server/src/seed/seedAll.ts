// UMS Backend - Comprehensive Seed Script
// Run with: npm run seed
// Seeds ALL 17 modules with realistic data

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database.js';
import {
  User, ROLES,
  Department,
  VienChuc,
  LeaveRequest,
  Contract,
  Student,
  Subject,
  Course,
  Enrollment,
  Curriculum,
  GraduationSession,
  Internship,
  DocumentModel,
  DocumentFolder,
  Tuition,
  Expense,
  Budget,
  Assignment,
  Submission,
  Exam,
  ExamSubmission,
  ResearchProject,
  KPI,
  KtxRoom,
  QaEvidence,
  WmsTask,
  IntegrationLog,
  OcrJob,
  DceCompetency,
  PmsMeeting,
  PortalAnnouncement,
  LibBook,
} from '../models/index.js';

// ─── SEED DATA ───────────────────────────────────────────────────────────────

const DEPT_DATA = [
  { code: 'KHOA-CNTT', name: 'Khoa Công nghệ Thông tin', shortName: 'CNTT', type: 'faculty' },
  { code: 'KHOA-KINHTE', name: 'Khoa Kinh tế', shortName: 'KT', type: 'faculty' },
  { code: 'KHOA-SUPHAM', name: 'Khoa Sư phạm', shortName: 'SP', type: 'faculty' },
  { code: 'KHOA-NGOAINGU', name: 'Khoa Ngoại ngữ', shortName: 'NN', type: 'faculty' },
  { code: 'KHOA-KHTN', name: 'Khoa Khoa học Tự nhiên', shortName: 'KHTN', type: 'faculty' },
  { code: 'PHONG-TC', name: 'Phòng Tài chính', shortName: 'TC', type: 'department' },
  { code: 'PHONG-HC', name: 'Phòng Hành chính', shortName: 'HC', type: 'department' },
  { code: 'PHONG-QHSV', name: 'Phòng Quản lý Học sinh Sinh viên', shortName: 'QHSV', type: 'department' },
  { code: 'PHONG-ĐT', name: 'Phòng Đào tạo', shortName: 'ĐT', type: 'department' },
  { code: 'PHONG-KHCN', name: 'Phòng Khoa học Công nghệ', shortName: 'KHCN', type: 'department' },
  { code: 'TT-THUVIEN', name: 'Trung tâm Thông tin Thư viện', shortName: 'TTTV', type: 'center' },
  { code: 'PHONG-KTX', name: 'Phòng Quản lý Ký túc xá', shortName: 'KTX', type: 'department' },
];

const USER_DATA = [
  { email: 'admin@truong.edu.vn', username: 'admin', password: 'Admin@123', displayName: 'Quản trị viên', role: ROLES.ADMIN, title: 'Quản trị viên hệ thống', phone: '0901234000', status: 'active' },
  { email: 'hieutruong@truong.edu.vn', username: 'ht', password: 'Ht@123', displayName: 'GS.TS. Hoàng Tuấn Anh', role: ROLES.HIEU_TRUONG, title: 'Hiệu trưởng', phone: '0901234001', status: 'active' },
  { email: 'phohieutruong@truong.edu.vn', username: 'pht', password: 'Pht@123', displayName: 'PGS.TS. Trần Lan Hương', role: ROLES.PHO_HIEU_TRUONG, title: 'Phó Hiệu trưởng', phone: '0901234002', status: 'active' },
  { email: 'truongkhoa@truong.edu.vn', username: 'tk', password: 'Tk@123', displayName: 'TS. Nguyễn Hoàng Long', role: ROLES.TRUONG_KHOA, title: 'Trưởng khoa CNTT', phone: '0901234003', status: 'active' },
  { email: 'giaovien1@truong.edu.vn', username: 'gv1', password: 'Gv1@123', displayName: 'ThS. Lê Văn Minh', role: ROLES.GIAO_VIEN, title: 'Giảng viên', phone: '0901234004', status: 'active' },
  { email: 'giaovien2@truong.edu.vn', username: 'gv2', password: 'Gv2@123', displayName: 'ThS. Phạm Thị Hương', role: ROLES.GIAO_VIEN, title: 'Giảng viên', phone: '0901234005', status: 'active' },
  { email: 'nhanvien@truong.edu.vn', username: 'nv', password: 'Nv@123', displayName: 'CN. Hoàng Thị Tân', role: ROLES.NHAN_VIEN, title: 'Nhân viên', phone: '0901234020', status: 'active' },
  { email: 'sinhvien1@truong.edu.vn', username: 'sv1', password: 'Sv@123', displayName: 'Nguyễn Văn An', role: ROLES.SINH_VIEN, title: 'Sinh viên', phone: '0901234030', status: 'active' },
  { email: 'sinhvien2@truong.edu.vn', username: 'sv2', password: 'Sv@123', displayName: 'Trần Thị Bình', role: ROLES.SINH_VIEN, title: 'Sinh viên', phone: '0901234031', status: 'active' },
  { email: 'sinhvien3@truong.edu.vn', username: 'sv3', password: 'Sv@123', displayName: 'Lê Hoàng Cường', role: ROLES.SINH_VIEN, title: 'Sinh viên', phone: '0901234032', status: 'active' },
];

const VC_DATA = [
  { code: 'VC-2015-001', name: 'PGS.TS. Nguyễn Hoàng Long', dob: new Date('1975-03-15'), gender: 'Nam', phone: '0901234003', email: 'vc.nguyen.hoang.long@truong.edu.vn', title: 'PGS.TS', position: 'Trưởng khoa', contractType: 'Cơ hữu', salary: 25000000, status: 'active', joinDate: new Date('2015-09-01'), education: 'Tiến sĩ', major: 'Công nghệ Thông tin', gradYear: 2010 },
  { code: 'VC-2016-002', name: 'TS. Trần Thị Mai Anh', dob: new Date('1982-07-22'), gender: 'Nữ', phone: '0901234004', email: 'vc.tran.thi.mai.anh@truong.edu.vn', title: 'TS', position: 'Giảng viên', contractType: 'Cơ hữu', salary: 18000000, status: 'active', joinDate: new Date('2016-01-15'), education: 'Thạc sĩ', major: 'Khoa học Máy tính', gradYear: 2012 },
  { code: 'VC-2017-003', name: 'ThS. Lê Văn Minh', dob: new Date('1988-11-08'), gender: 'Nam', phone: '0901234006', email: 'vc.le.van.minh@truong.edu.vn', title: 'ThS', position: 'Giảng viên', contractType: 'Cơ hữu', salary: 15000000, status: 'active', joinDate: new Date('2017-08-20'), education: 'Thạc sĩ', major: 'Khoa học Máy tính', gradYear: 2015 },
  { code: 'VC-2018-004', name: 'ThS. Phạm Thị Hương', dob: new Date('1990-04-30'), gender: 'Nữ', phone: '0901234007', email: 'vc.pham.thi.huong@truong.edu.vn', title: 'ThS', position: 'Giảng viên', contractType: 'Cơ hữu', salary: 15000000, status: 'active', joinDate: new Date('2018-02-10'), education: 'Thạc sĩ', major: 'Sư phạm Toán', gradYear: 2016 },
  { code: 'VC-2019-005', name: 'KS. Ngô Đức Anh', dob: new Date('1992-09-14'), gender: 'Nam', phone: '0901234010', email: 'vc.ngo.duc.anh@truong.edu.vn', title: 'KS', position: 'Chuyên viên', contractType: 'Cơ hữu', salary: 12000000, status: 'active', joinDate: new Date('2019-06-01'), education: 'Cử nhân', major: 'Công nghệ Thông tin', gradYear: 2017 },
  { code: 'VC-2020-006', name: 'CN. Hoàng Thị Lan', dob: new Date('1995-01-25'), gender: 'Nữ', phone: '0901234020', email: 'vc.hoang.thi.lan@truong.edu.vn', title: 'CN', position: 'Nhân viên', contractType: 'Thử việc', salary: 8000000, status: 'trial', joinDate: new Date('2020-03-15'), education: 'Cử nhân', major: 'Quản trị Kinh doanh', gradYear: 2019 },
  { code: 'VC-2015-007', name: 'PGS.TS. Đặng Quốc Bảo', dob: new Date('1973-06-18'), gender: 'Nam', phone: '0901234011', email: 'vc.dang.quoc.bao@truong.edu.vn', title: 'PGS.TS', position: 'Trưởng phòng', contractType: 'Cơ hữu', salary: 22000000, status: 'active', joinDate: new Date('2015-02-01'), education: 'Tiến sĩ', major: 'Quản lý Giáo dục', gradYear: 2008 },
  { code: 'VC-2016-008', name: 'TS. Lý Thị Thu Hà', dob: new Date('1980-12-03'), gender: 'Nữ', phone: '0901234012', email: 'vc.ly.thi.thu.ha@truong.edu.vn', title: 'TS', position: 'Phó trưởng phòng', contractType: 'Cơ hữu', salary: 18000000, status: 'active', joinDate: new Date('2016-09-01'), education: 'Tiến sĩ', major: 'Tài chính Ngân hàng', gradYear: 2014 },
];

const LEAVE_DATA = [
  { type: 'annual', startDate: new Date('2026-01-15'), endDate: new Date('2026-01-22'), reason: 'Nghỉ Tết Dương lịch', status: 'approved', days: 7 },
  { type: 'sick', startDate: new Date('2026-02-10'), endDate: new Date('2026-02-12'), reason: 'Ốm đau', status: 'approved', days: 2 },
  { type: 'annual', startDate: new Date('2026-03-01'), endDate: new Date('2026-03-05'), reason: 'Nghỉ phép năm', status: 'pending', days: 5 },
];

const CONTRACT_DATA = [
  { code: 'HD-2025-001', type: 'Cơ hữu', startDate: new Date('2020-01-01'), salary: 25000000, status: 'active', signedAt: new Date('2020-01-01') },
  { code: 'HD-2025-002', type: 'Cơ hữu', startDate: new Date('2021-01-01'), salary: 18000000, status: 'active', signedAt: new Date('2021-01-01') },
  { code: 'HD-2025-003', type: 'Cơ hữu', startDate: new Date('2022-01-01'), salary: 15000000, status: 'active', signedAt: new Date('2022-01-01') },
  { code: 'HD-2025-004', type: 'Thỉnh giảng', startDate: new Date('2025-09-01'), endDate: new Date('2026-06-30'), salary: 12000000, status: 'active', signedAt: new Date('2025-08-15') },
  { code: 'HD-2025-005', type: 'Thử việc', startDate: new Date('2026-01-01'), endDate: new Date('2026-03-31'), salary: 8000000, status: 'expired', signedAt: new Date('2026-01-01') },
  { code: 'HD-2025-006', type: 'Cơ hữu', startDate: new Date('2023-01-01'), salary: 22000000, status: 'active', signedAt: new Date('2023-01-01') },
];

const SUBJECT_DATA = [
  { code: 'INT1001', name: 'Nhập môn Lập trình', credits: 3, theoryHours: 30, practiceHours: 30, isActive: true },
  { code: 'INT1002', name: 'Cấu trúc Dữ liệu', credits: 3, theoryHours: 30, practiceHours: 30, isActive: true },
  { code: 'INT2001', name: 'Cơ sở Dữ liệu', credits: 3, theoryHours: 30, practiceHours: 30, isActive: true },
  { code: 'INT2002', name: 'Mạng Máy tính', credits: 3, theoryHours: 30, practiceHours: 30, isActive: true },
  { code: 'INT2003', name: 'Phát triển Web', credits: 3, theoryHours: 30, practiceHours: 30, isActive: true },
  { code: 'INT3001', name: 'Trí tuệ Nhân tạo', credits: 3, theoryHours: 30, practiceHours: 30, isActive: true },
  { code: 'INT3002', name: 'An toàn Thông tin', credits: 3, theoryHours: 30, practiceHours: 30, isActive: true },
  { code: 'MATH1001', name: 'Toán cao cấp A1', credits: 4, theoryHours: 45, practiceHours: 15, isActive: true },
  { code: 'MATH1002', name: 'Toán rời rạc', credits: 3, theoryHours: 30, practiceHours: 30, isActive: true },
  { code: 'PHYS1001', name: 'Vật lý đại cương', credits: 3, theoryHours: 30, practiceHours: 15, isActive: true },
  { code: 'ENGL1001', name: 'Tiếng Anh 1', credits: 3, theoryHours: 30, practiceHours: 30, isActive: true },
  { code: 'ENGL1002', name: 'Tiếng Anh 2', credits: 3, theoryHours: 30, practiceHours: 30, isActive: true },
  { code: 'ECON1001', name: 'Kinh tế vi mô', credits: 3, theoryHours: 45, practiceHours: 0, isActive: true },
  { code: 'LAW1001', name: 'Luật kinh tế', credits: 2, theoryHours: 30, practiceHours: 0, isActive: true },
  { code: 'EDU1001', name: 'Tâm lý học đại cương', credits: 2, theoryHours: 30, practiceHours: 0, isActive: true },
  { code: 'EDU1002', name: 'Giáo dục học đại cương', credits: 2, theoryHours: 30, practiceHours: 0, isActive: true },
];

const COURSE_DATA = [
  { code: 'INT1001-2025-1', name: 'Nhập môn Lập trình - HK1 2025-2026', semester: 1, academicYear: '2025-2026', schedule: 'Thứ 2, 4 (07:00-09:30)', room: 'A101', maxStudents: 80, status: 'open', startDate: new Date('2025-09-01'), endDate: new Date('2026-01-15') },
  { code: 'INT1002-2025-1', name: 'Cấu trúc Dữ liệu - HK1 2025-2026', semester: 1, academicYear: '2025-2026', schedule: 'Thứ 3, 5 (07:00-09:30)', room: 'A102', maxStudents: 60, status: 'open', startDate: new Date('2025-09-01'), endDate: new Date('2026-01-15') },
  { code: 'INT2001-2025-1', name: 'Cơ sở Dữ liệu - HK1 2025-2026', semester: 3, academicYear: '2025-2026', schedule: 'Thứ 4, 6 (13:00-15:30)', room: 'B201', maxStudents: 60, status: 'open', startDate: new Date('2025-09-01'), endDate: new Date('2026-01-15') },
  { code: 'INT2002-2025-1', name: 'Mạng Máy tính - HK1 2025-2026', semester: 3, academicYear: '2025-2026', schedule: 'Thứ 2, 4 (13:00-15:30)', room: 'B202', maxStudents: 50, status: 'open', startDate: new Date('2025-09-01'), endDate: new Date('2026-01-15') },
  { code: 'INT2003-2025-1', name: 'Phát triển Web - HK1 2025-2026', semester: 3, academicYear: '2025-2026', schedule: 'Thứ 5, 7 (07:00-09:30)', room: 'C301', maxStudents: 50, status: 'open', startDate: new Date('2025-09-01'), endDate: new Date('2026-01-15') },
  { code: 'INT3001-2025-1', name: 'Trí tuệ Nhân tạo - HK1 2025-2026', semester: 5, academicYear: '2025-2026', schedule: 'Thứ 3, 5 (10:00-12:00)', room: 'C302', maxStudents: 40, status: 'open', startDate: new Date('2025-09-01'), endDate: new Date('2026-01-15') },
  { code: 'MATH1001-2025-1', name: 'Toán cao cấp A1 - HK1 2025-2026', semester: 1, academicYear: '2025-2026', schedule: 'Thứ 2, 4, 6 (10:00-11:30)', room: 'D101', maxStudents: 120, status: 'open', startDate: new Date('2025-09-01'), endDate: new Date('2026-01-15') },
  { code: 'ENGL1001-2025-1', name: 'Tiếng Anh 1 - HK1 2025-2026', semester: 1, academicYear: '2025-2026', schedule: 'Thứ 3, 5 (15:30-17:00)', room: 'E101', maxStudents: 40, status: 'open', startDate: new Date('2025-09-01'), endDate: new Date('2026-01-15') },
  { code: 'ECON1001-2025-1', name: 'Kinh tế vi mô - HK1 2025-2026', semester: 1, academicYear: '2025-2026', schedule: 'Thứ 2, 4 (15:30-17:00)', room: 'F101', maxStudents: 100, status: 'open', startDate: new Date('2025-09-01'), endDate: new Date('2026-01-15') },
  { code: 'EDU1001-2025-1', name: 'Tâm lý học đại cương - HK1 2025-2026', semester: 1, academicYear: '2025-2026', schedule: 'Thứ 6 (07:00-11:00)', room: 'G101', maxStudents: 80, status: 'open', startDate: new Date('2025-09-01'), endDate: new Date('2026-01-15') },
];

const GRADUATION_SESSION_DATA = [
  { name: 'Đợt tốt nghiệp tháng 6/2026', semester: 'HK2', academicYear: '2025-2026', openDate: new Date('2026-05-01'), closeDate: new Date('2026-05-31'), reviewDate: new Date('2026-06-15'), status: 'open', description: 'Đợt tốt nghiệp tháng 6 năm học 2025-2026' },
  { name: 'Đợt tốt nghiệp tháng 1/2026', semester: 'HK1', academicYear: '2025-2026', openDate: new Date('2025-12-01'), closeDate: new Date('2025-12-31'), reviewDate: new Date('2026-01-10'), status: 'closed', description: 'Đợt tốt nghiệp tháng 1 năm học 2025-2026' },
  { name: 'Đợt tốt nghiệp tháng 8/2025', semester: 'HK3', academicYear: '2024-2025', openDate: new Date('2025-07-01'), closeDate: new Date('2025-07-31'), reviewDate: new Date('2025-08-10'), status: 'reviewed', description: 'Đợt tốt nghiệp hè năm học 2024-2025' },
];

const INTERNSHIP_DATA = [
  { studentCode: 'SV-23-0001', studentName: 'Nguyễn Văn An', className: '21T1', major: 'Công nghệ Thông tin', company: 'FPT Software', position: 'Thực tập sinh Backend', location: 'TP.HCM', startDate: new Date('2026-01-15'), endDate: new Date('2026-06-30'), supervisor: 'Nguyễn Văn Minh', supervisorPhone: '0901234567', supervisorEmail: 'nvminh@fpt.com.vn', status: 'in_progress', progress: 75, reportSubmitted: false, description: 'Thực tập vị trí Backend Developer tại FPT Software' },
  { studentCode: 'SV-24-0002', studentName: 'Trần Thị Bình', className: '21T1', major: 'Công nghệ Thông tin', company: 'Viettel Solutions', position: 'Thực tập sinh QA', location: 'Hà Nội', startDate: new Date('2026-01-15'), endDate: new Date('2026-06-30'), supervisor: 'Trần Thu Hà', supervisorPhone: '0912345678', supervisorEmail: 'tth@viettel.com.vn', status: 'completed', progress: 100, reportSubmitted: true, grade: 8.5, description: 'Thực tập vị trí QA tại Viettel Solutions' },
  { studentCode: 'SV-25-0003', studentName: 'Lê Hoàng Cường', className: '22T1', major: 'Công nghệ Thông tin', company: 'VNG Corporation', position: 'Thực tập sinh Game Developer', location: 'TP.HCM', startDate: new Date('2026-02-01'), endDate: new Date('2026-07-31'), supervisor: 'Lê Thị Lan', supervisorPhone: '0923456789', supervisorEmail: 'ltl@vng.com.vn', status: 'in_progress', progress: 40, reportSubmitted: false, description: 'Thực tập vị trí Game Developer tại VNG Corporation' },
  { studentCode: 'SV-26-0004', studentName: 'Phạm Thị Dung', className: '22T2', major: 'Công nghệ Thông tin', company: 'CMC Corporation', position: 'Thực tập sinh DevOps', location: 'Hà Nội', startDate: new Date('2026-01-01'), endDate: new Date('2026-06-30'), supervisor: 'Phạm Đức Long', supervisorPhone: '0934567890', supervisorEmail: 'pdl@cmc.com.vn', status: 'registered', progress: 0, reportSubmitted: false, description: 'Thực tập vị trí DevOps tại CMC Corporation' },
];

const LETTER_GRADES: Array<'A+'|'A'|'B+'|'B'|'C+'|'C'|'D+'|'D'|'F'> = ['A', 'B+', 'B', 'C+', 'C', 'D', 'F'];

function generateStudentData(deptIds: mongoose.Types.ObjectId[], userIds: mongoose.Types.ObjectId[], adminId: mongoose.Types.ObjectId) {
  const names = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Thị Dung', 'Hoàng Văn Em', 'Ngô Thị Phượng', 'Đặng Văn Giang', 'Bùi Thị Hoa', 'Cao Văn Inh', 'Đỗ Thị Jun', 'Phan Văn Kha', 'Trương Thị Lan', 'Vũ Văn Minh', 'Đinh Thị Ngọc', 'Lý Văn Phong', 'Mai Thị Quỳnh', 'Nguyễn Văn Rùa', 'Phạm Thị Sương', 'Trần Văn Tài', 'Võ Thị Uyên', 'Trịnh Văn Vang', 'Nguyễn Thị Xuyến', 'Lê Văn Yến', 'Trần Thị Zí', 'Phạm Văn Âu', 'Hoàng Thị Ê', 'Nguyễn Văn Ô', 'Trần Thị Ơ', 'Lê VănƯ', 'Phạm Thị Văn'];
  const statuses: Array<'studying'|'graduated'|'suspended'|'reserved'> = ['studying', 'studying', 'studying', 'studying', 'graduated', 'reserved', 'reserved'];
  const years = [2023, 2024, 2025, 2026];
  return names.map((name, i) => {
    const year = years[i % years.length];
    const yearSuffix = year.toString().slice(-2);
    const code = `SV-${yearSuffix}-${String(i + 1).padStart(4, '0')}`;
    const userId = i < Math.min(userIds.length, names.length) ? userIds[i] : undefined;
    return {
      code, name,
      dob: new Date(`${1998 + (i % 8)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`),
      gender: i % 3 === 0 ? 'Nữ' : 'Nam',
      phone: `0901${String(234000 + i).padStart(6, '0')}`,
      email: `${name.toLowerCase().replace(/ /g, '.').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}@sinhvien.truong.edu.vn`,
      address: `${i + 1} Đường ${['Lê Lợi', 'Nguyễn Trãi', 'Trần Hưng Đạo', 'Võ Văn Tần', 'Pasteur'][i % 5]}, TP.HCM`,
      ethnicity: 'Kinh',
      department: deptIds[i % 3],
      courseYear: 2026 - year + 1,
      className: `${['21T1', '21T2', '22T1', '22T2', '23T1', '23T2', '24T1', '24T2', '25T1', '25T2'][i % 10]}`,
      status: statuses[i % statuses.length],
      enrollmentDate: new Date(`${year}-09-01`),
      gpa: i % 7 !== 5 ? parseFloat((2.5 + (i % 15) * 0.1).toFixed(2)) : undefined,
      totalCredits: i % 7 !== 5 ? 40 + (i % 60) : undefined,
      user: userId,
      createdBy: adminId,
      updatedBy: adminId,
    };
  });
}

function generateEnrollmentData(studentIds: mongoose.Types.ObjectId[], courseIds: mongoose.Types.ObjectId[], _adminId: mongoose.Types.ObjectId) {
  const statuses: Array<'enrolled'|'in_progress'|'completed'|'failed'|'withdrawn'> = ['completed', 'completed', 'in_progress', 'in_progress', 'enrolled'];
  const data = [];
  for (let c = 0; c < Math.min(courseIds.length, 5); c++) {
    for (let s = 0; s < 5; s++) {
      const studentIdx = c * 3 + s;
      if (studentIdx >= studentIds.length) break;
      const letterGrade = LETTER_GRADES[(c + s) % LETTER_GRADES.length];
      const midterm = parseFloat((5 + (c + s) * 0.5).toFixed(1));
      const finalScore = parseFloat((5 + (c + s * 2) * 0.4).toFixed(1));
      const total = parseFloat((midterm * 0.3 + finalScore * 0.7).toFixed(1));
      data.push({
        student: studentIds[studentIdx], course: courseIds[c],
        academicTerm: 'HK1-2025-2026',
        status: statuses[(c + s) % statuses.length],
        enrollmentDate: new Date('2025-09-01'),
        midtermScore: midterm, finalScore, totalScore: total,
        letterGrade: letterGrade as any,
        attendanceCount: 28 + (s % 5), totalSessions: 30,
        gradedBy: undefined, gradedAt: undefined,
      });
    }
  }
  return data;
}

const ASSIGNMENT_DATA = [
  { title: 'Bài tập tuần 1 - Giới thiệu Python', type: 'individual', maxScore: 10, weight: 0.1, dueDate: new Date('2025-09-15'), allowLateSubmission: true, maxLateDays: 3, status: 'graded', openDate: new Date('2025-09-01') },
  { title: 'Bài tập tuần 2 - Biến và Kiểu dữ liệu', type: 'individual', maxScore: 10, weight: 0.1, dueDate: new Date('2025-09-22'), allowLateSubmission: true, maxLateDays: 3, status: 'graded', openDate: new Date('2025-09-08') },
  { title: 'Bài tập tuần 3 - Vòng lặp', type: 'individual', maxScore: 10, weight: 0.1, dueDate: new Date('2025-09-29'), allowLateSubmission: true, maxLateDays: 3, status: 'graded', openDate: new Date('2025-09-15') },
  { title: 'Bài tập tuần 4 - Hàm', type: 'individual', maxScore: 10, weight: 0.1, dueDate: new Date('2025-10-06'), allowLateSubmission: false, status: 'graded', openDate: new Date('2025-09-22') },
  { title: 'Bài tập tuần 5 - List & Dictionary', type: 'individual', maxScore: 10, weight: 0.1, dueDate: new Date('2025-10-13'), allowLateSubmission: false, status: 'graded', openDate: new Date('2025-09-29') },
  { title: 'Đồ án nhóm - Ứng dụng Console', type: 'group', maxScore: 10, weight: 0.3, dueDate: new Date('2025-11-15'), allowLateSubmission: false, allowResubmit: true, maxResubmitCount: 2, status: 'graded', openDate: new Date('2025-10-01') },
  { title: 'Quiz 1 - Ôn tập giữa kỳ', type: 'quiz', maxScore: 10, weight: 0.1, dueDate: new Date('2025-10-20'), allowLateSubmission: false, status: 'graded', openDate: new Date('2025-10-13') },
  { title: 'Bài tập tuần 7 - OOP', type: 'individual', maxScore: 10, weight: 0.1, dueDate: new Date('2025-11-03'), allowLateSubmission: true, maxLateDays: 2, status: 'published', openDate: new Date('2025-10-20') },
  { title: 'Bài tập tuần 8 - File I/O', type: 'individual', maxScore: 10, weight: 0.1, dueDate: new Date('2025-11-10'), allowLateSubmission: false, status: 'published', openDate: new Date('2025-10-27') },
  { title: 'Đồ án cuối kỳ', type: 'project', maxScore: 10, weight: 0.3, dueDate: new Date('2025-12-31'), allowLateSubmission: false, allowResubmit: false, status: 'published', openDate: new Date('2025-11-01') },
];

const EXAM_DATA = [
  { code: 'THI-GK-2025-INT1001', title: 'Thi giữa kỳ - Nhập môn Lập trình', semester: 1, academicYear: '2025-2026', type: 'midterm', duration: 90, totalScore: 10, passingScore: 5, scheduledAt: new Date('2025-10-25T07:00:00'), room: 'A101', status: 'completed' },
  { code: 'THI-CK-2025-INT1001', title: 'Thi cuối kỳ - Nhập môn Lập trình', semester: 1, academicYear: '2025-2026', type: 'final', duration: 120, totalScore: 10, passingScore: 5, scheduledAt: new Date('2026-01-10T07:00:00'), room: 'A101', status: 'ongoing' },
  { code: 'THI-GK-2025-MATH1001', title: 'Thi giữa kỳ - Toán cao cấp A1', semester: 1, academicYear: '2025-2026', type: 'midterm', duration: 90, totalScore: 10, passingScore: 4, scheduledAt: new Date('2025-10-26T07:00:00'), room: 'D101', status: 'completed' },
  { code: 'THI-CK-2025-MATH1001', title: 'Thi cuối kỳ - Toán cao cấp A1', semester: 1, academicYear: '2025-2026', type: 'final', duration: 120, totalScore: 10, passingScore: 4, scheduledAt: new Date('2026-01-12T07:00:00'), room: 'D101', status: 'scheduled' },
  { code: 'THI-CK-2025-INT1002', title: 'Thi cuối kỳ - Cấu trúc Dữ liệu', semester: 1, academicYear: '2025-2026', type: 'final', duration: 120, totalScore: 10, passingScore: 5, scheduledAt: new Date('2026-01-14T07:00:00'), room: 'A102', status: 'scheduled' },
  { code: 'THI-GK-2025-ENGL1001', title: 'Thi giữa kỳ - Tiếng Anh 1', semester: 1, academicYear: '2025-2026', type: 'midterm', duration: 60, totalScore: 10, passingScore: 5, scheduledAt: new Date('2025-10-27T15:30:00'), room: 'E101', status: 'completed' },
  { code: 'QUIZ-2025-INT1001', title: 'Quiz tuần 3 - Nhập môn Lập trình', semester: 1, academicYear: '2025-2026', type: 'quiz', duration: 30, totalScore: 10, passingScore: 5, scheduledAt: new Date('2025-09-22T10:00:00'), room: 'A101', status: 'completed' },
  { code: 'THI-TH-2025-INT1001', title: 'Thi thực hành - Nhập môn Lập trình', semester: 1, academicYear: '2025-2026', type: 'practical', duration: 90, totalScore: 10, passingScore: 5, scheduledAt: new Date('2025-12-20T13:00:00'), room: 'LAB1', status: 'draft' },
];

const DOC_DATA = [
  { code: 'VB-2025-001', title: 'Quyết định về việc ban hành nội quy thi cử', type: 'Quyết định', status: 'signed', priority: 'high' as const },
  { code: 'VB-2025-002', title: 'Kế hoạch tuyển sinh năm học 2025-2026', type: 'Kế hoạch', status: 'approved', priority: 'normal' as const },
  { code: 'VB-2025-003', title: 'Báo cáo tổng kết năm học 2024-2025', type: 'Báo cáo', status: 'pending', priority: 'normal' as const },
  { code: 'VB-2025-004', title: 'Quy định về đào tạo thạc sĩ', type: 'Quy định', status: 'signed', priority: 'high' as const },
  { code: 'VB-2025-005', title: 'Hướng dẫn thực tập tốt nghiệp', type: 'Hướng dẫn', status: 'approved', priority: 'normal' as const },
  { code: 'VB-2025-006', title: 'Biên bản họp hội đồng khoa học', type: 'Biên bản', status: 'draft', priority: 'low' as const },
  { code: 'VB-2025-007', title: 'Đề xuất kinh phí mua sắm thiết bị', type: 'Đề xuất', status: 'pending', priority: 'urgent' as const },
  { code: 'VB-2025-008', title: 'Công văn xin gia hạn thời gian nghiệm thu', type: 'Công văn', status: 'draft', priority: 'normal' as const },
  { code: 'VB-2025-009', title: 'Thông báo lịch thi học kỳ 1', type: 'Thông báo', status: 'signed', priority: 'high' as const },
  { code: 'VB-2025-010', title: 'Quy chế đào tạo theo hệ thống tín chỉ', type: 'Quy chế', status: 'signed', priority: 'high' as const },
  { code: 'VB-2025-011', title: 'Kế hoạch tổ chức hội thảo khoa học', type: 'Kế hoạch', status: 'approved', priority: 'normal' as const },
  { code: 'VB-2025-012', title: 'Báo cáo tài chính quý 3 năm 2025', type: 'Báo cáo', status: 'pending', priority: 'urgent' as const },
];

const EXPENSE_DATA = [
  { code: 'CP-2025-001', description: 'Chi phí điện nước tháng 1/2025', category: 'Điện nước', amount: 45000000, date: new Date('2025-02-05'), vendor: 'Điện lực TP.HCM', status: 'paid' as const },
  { code: 'CP-2025-002', description: 'Chi phí internet tháng 1/2025', category: 'Internet', amount: 15000000, date: new Date('2025-02-10'), vendor: 'VNPT TP.HCM', status: 'paid' as const },
  { code: 'CP-2025-003', description: 'Mua sắm máy tính bàn cho phòng máy', category: 'Thiết bị', amount: 200000000, date: new Date('2025-03-15'), vendor: 'FPT Shop', status: 'approved' as const },
  { code: 'CP-2025-004', description: 'Chi phí văn phòng phẩm tháng 3/2025', category: 'Văn phòng phẩm', amount: 8500000, date: new Date('2025-04-01'), vendor: 'Nhà sách Nguyễn Văn Cừ', status: 'paid' as const },
  { code: 'CP-2025-005', description: 'Sửa chữa hệ thống máy lạnh', category: 'Bảo trì', amount: 25000000, date: new Date('2025-04-20'), vendor: 'Điện lạnh Hoàng Gia', status: 'pending' as const },
  { code: 'CP-2025-006', description: 'Kinh phí tổ chức hội thảo khoa học', category: 'Sự kiện', amount: 80000000, date: new Date('2025-05-10'), vendor: 'Trung tâm Hội nghị', status: 'approved' as const },
];

const RESEARCH_DATA = [
  { code: 'NCKH-2024-001', title: 'Nghiên cứu ứng dụng AI trong giáo dục', field: 'Công nghệ Thông tin', level: 'Cấp trường', startDate: new Date('2024-01-15'), endDate: new Date('2024-12-30'), budget: 100000000, status: 'completed' as const },
  { code: 'NCKH-2024-002', title: 'Xây dựng hệ thống quản lý học tập trực tuyến', field: 'Công nghệ Thông tin', level: 'Cấp Bộ', startDate: new Date('2024-03-01'), endDate: new Date('2025-06-30'), budget: 500000000, status: 'ongoing' as const },
  { code: 'NCKH-2024-003', title: 'Phát triển năng lực số cho sinh viên sư phạm', field: 'Sư phạm', level: 'Cấp trường', startDate: new Date('2024-06-01'), endDate: new Date('2025-05-31'), budget: 80000000, status: 'ongoing' as const },
  { code: 'NCKH-2025-001', title: 'Ứng dụng Blockchain trong quản lý văn bằng', field: 'Công nghệ Thông tin', level: 'Cấp trường', startDate: new Date('2025-01-10'), endDate: new Date('2025-12-30'), budget: 120000000, status: 'approved' as const },
  { code: 'NCKH-2025-002', title: 'Nghiên cứu chuyển đổi số trong trường đại học', field: 'Quản trị', level: 'Cấp Bộ', startDate: new Date('2025-03-15'), endDate: new Date('2027-03-14'), budget: 800000000, status: 'proposal' as const },
  { code: 'NCKH-2025-003', title: 'Đánh giá hiệu quả đào tạo từ xa', field: 'Giáo dục', level: 'Cấp trường', startDate: new Date('2025-02-01'), endDate: new Date('2025-12-31'), budget: 60000000, status: 'ongoing' as const },
];

const KPI_DATA = [
  { code: 'KPI-2025-01', name: 'Tỷ lệ sinh viên tốt nghiệp đúng hạn', module: 'SIS', target: 85, current: 82, unit: '%', period: 'yearly' as const, year: 2025, status: 'active' as const },
  { code: 'KPI-2025-02', name: 'Số lượng đề tài NCKH được nghiệm thu', module: 'RIT', target: 15, current: 8, unit: 'đề tài', period: 'yearly' as const, year: 2025, status: 'active' as const },
  { code: 'KPI-2025-03', name: 'Tỷ lệ viên chức hoàn thành đào tạo', module: 'HRM', target: 95, current: 88, unit: '%', period: 'yearly' as const, year: 2025, status: 'active' as const },
  { code: 'KPI-2025-04', name: 'Doanh thu từ đào tạo không ngắn hạn', module: 'FIN', target: 5000000000, current: 3200000000, unit: 'VND', period: 'yearly' as const, year: 2025, status: 'active' as const },
  { code: 'KPI-2025-05', name: 'Tỷ lệ phòng KTX sử dụng hiệu quả', module: 'KTX', target: 90, current: 78, unit: '%', period: 'yearly' as const, year: 2025, status: 'active' as const },
];

const ROOM_DATA = [
  { code: 'KTX-A101', building: 'A', floor: 1, type: 'male' as const, capacity: 6, currentOccupancy: 6, pricePerMonth: 1200000, facilities: ['Giường tầng', 'Bàn học', 'Quạt máy'], status: 'full' as const },
  { code: 'KTX-A102', building: 'A', floor: 1, type: 'male' as const, capacity: 6, currentOccupancy: 4, pricePerMonth: 1200000, facilities: ['Giường tầng', 'Bàn học', 'Quạt máy', 'Điều hòa'], status: 'available' as const },
  { code: 'KTX-A201', building: 'A', floor: 2, type: 'male' as const, capacity: 6, currentOccupancy: 6, pricePerMonth: 1200000, facilities: ['Giường tầng', 'Bàn học', 'Quạt máy'], status: 'full' as const },
  { code: 'KTX-A202', building: 'A', floor: 2, type: 'male' as const, capacity: 6, currentOccupancy: 2, pricePerMonth: 1200000, facilities: ['Giường tầng', 'Bàn học', 'Quạt máy'], status: 'available' as const },
  { code: 'KTX-B101', building: 'B', floor: 1, type: 'female' as const, capacity: 6, currentOccupancy: 6, pricePerMonth: 1200000, facilities: ['Giường tầng', 'Bàn học', 'Quạt máy', 'Điều hòa'], status: 'full' as const },
  { code: 'KTX-B102', building: 'B', floor: 1, type: 'female' as const, capacity: 6, currentOccupancy: 5, pricePerMonth: 1200000, facilities: ['Giường tầng', 'Bàn học', 'Quạt máy', 'Điều hòa'], status: 'available' as const },
  { code: 'KTX-B201', building: 'B', floor: 2, type: 'female' as const, capacity: 6, currentOccupancy: 6, pricePerMonth: 1200000, facilities: ['Giường tầng', 'Bàn học', 'Quạt máy', 'Điều hòa'], status: 'full' as const },
  { code: 'KTX-B202', building: 'B', floor: 2, type: 'female' as const, capacity: 6, currentOccupancy: 3, pricePerMonth: 1200000, facilities: ['Giường tầng', 'Bàn học', 'Quạt máy', 'Điều hòa'], status: 'available' as const },
  { code: 'KTX-C101', building: 'C', floor: 1, type: 'mixed' as const, capacity: 4, currentOccupancy: 0, pricePerMonth: 1800000, facilities: ['Giường đơn', 'Bàn học', 'Điều hòa', 'Tủ lạnh'], status: 'available' as const },
  { code: 'KTX-C102', building: 'C', floor: 1, type: 'mixed' as const, capacity: 4, currentOccupancy: 0, pricePerMonth: 1800000, facilities: ['Giường đơn', 'Bàn học', 'Điều hòa', 'Tủ lạnh'], status: 'maintenance' as const },
];

const QA_DATA = [
  { standard: 'Tiêu chuẩn 1', criteria: 'Mục tiêu và chuẩn đầu ra', title: 'Minh chứng chuẩn đầu ra CTĐT', description: 'Bộ tài liệu minh chứng chuẩn đầu ra chương trình đào tạo', fileUrls: ['/files/minh-chung/CDR-INT1001.pdf'], status: 'approved' as const },
  { standard: 'Tiêu chuẩn 2', criteria: 'Quy hoạch đào tạo', title: 'Kế hoạch đào tạo 5 năm', description: 'Quy hoạch phát triển đào tạo giai đoạn 2020-2025', fileUrls: ['/files/minh-chung/Ke-hoach-5nam.pdf'], status: 'approved' as const },
  { standard: 'Tiêu chuẩn 3', criteria: 'Nhân sự', title: 'Danh sách giảng viên cơ hữu', description: 'Danh sách và hồ sơ nhân sự giảng viên', fileUrls: ['/files/minh-chung/DS-GV.pdf'], status: 'submitted' as const },
  { standard: 'Tiêu chuẩn 4', criteria: 'Cơ sở vật chất', title: 'Hình ảnh phòng học và phòng lab', description: 'Tài liệu hình ảnh cơ sở vật chất phục vụ đào tạo', fileUrls: ['/files/minh-chung/CNVP-CLC.jpg'], status: 'draft' as const },
];

const TASK_DATA = [
  { code: 'CV-2025-001', title: 'Hoàn thiện báo cáo tự đánh giá AUN', description: 'Tổng hợp và hoàn thiện báo cáo tự đánh giá theo tiêu chuẩn AUN-QA', priority: 'high' as const, status: 'in_progress' as const, dueDate: new Date('2025-08-30') },
  { code: 'CV-2025-002', title: 'Cập nhật chuẩn đầu ra CTĐT', description: 'Rà soát và cập nhật chuẩn đầu ra cho các CTĐT', priority: 'medium' as const, status: 'todo' as const, dueDate: new Date('2025-09-15') },
  { code: 'CV-2025-003', title: 'Triển khai hệ thống LMS', description: 'Cài đặt và cấu hình hệ thống quản lý học tập trực tuyến', priority: 'high' as const, status: 'in_progress' as const, dueDate: new Date('2025-07-30') },
  { code: 'CV-2025-004', title: 'Đánh giá năng lực giảng viên', description: 'Tổ chức đánh giá năng lực giảng viên cuối năm học', priority: 'medium' as const, status: 'todo' as const, dueDate: new Date('2025-12-20') },
  { code: 'CV-2025-005', title: 'Chuẩn bị kiểm định chương trình đào tạo', description: 'Họp báo cáo tiến độ và chuẩn bị hồ sơ kiểm định', priority: 'critical' as const, status: 'review' as const, dueDate: new Date('2025-07-15') },
  { code: 'CV-2025-006', title: 'Cập nhật website Khoa CNTT', description: 'Thiết kế và cập nhật nội dung website Khoa CNTT', priority: 'low' as const, status: 'done' as const, completedAt: new Date('2025-06-30') },
];

const BOOK_DATA = [
  { isbn: '978-0134685991', title: 'Effective Java', authors: ['Joshua Bloch'], publisher: 'Addison-Wesley', year: 2018, category: 'Công nghệ', copies: 5, available: 3, location: 'Tầng 2, Kệ A-01' },
  { isbn: '978-0321125217', title: 'Domain-Driven Design', authors: ['Eric Evans'], publisher: 'Addison-Wesley', year: 2003, category: 'Công nghệ', copies: 3, available: 2, location: 'Tầng 2, Kệ A-02' },
  { isbn: '978-0201633610', title: 'Design Patterns', authors: ['Erich Gamma', 'Richard Helm', 'Ralph Johnson', 'John Vlissides'], publisher: 'Addison-Wesley', year: 1994, category: 'Công nghệ', copies: 4, available: 4, location: 'Tầng 2, Kệ A-03' },
  { isbn: '978-0262033848', title: 'Introduction to Algorithms', authors: ['Thomas H. Cormen', 'Charles E. Leiserson', 'Ronald L. Rivest', 'Clifford Stein'], publisher: 'MIT Press', year: 2009, category: 'Công nghệ', copies: 6, available: 2, location: 'Tầng 2, Kệ A-04' },
  { isbn: '978-0321127426', title: 'Patterns of Enterprise Application Architecture', authors: ['Martin Fowler'], publisher: 'Addison-Wesley', year: 2002, category: 'Công nghệ', copies: 3, available: 3, location: 'Tầng 2, Kệ A-05' },
  { isbn: '978-0132350884', title: 'Clean Code', authors: ['Robert C. Martin'], publisher: 'Prentice Hall', year: 2008, category: 'Công nghệ', copies: 5, available: 1, location: 'Tầng 2, Kệ A-06' },
  { isbn: '978-1491950357', title: 'Building Microservices', authors: ['Sam Newman'], publisher: "O'Reilly", year: 2015, category: 'Công nghệ', copies: 3, available: 3, location: 'Tầng 2, Kệ A-07' },
  { isbn: '978-0321125170', title: 'Clean Architecture', authors: ['Robert C. Martin'], publisher: 'Prentice Hall', year: 2017, category: 'Công nghệ', copies: 4, available: 4, location: 'Tầng 2, Kệ A-08' },
  { isbn: '978-0321573513', title: 'Algorithms', authors: ['Robert Sedgewick', 'Kevin Wayne'], publisher: 'Addison-Wesley', year: 2011, category: 'Công nghệ', copies: 5, available: 5, location: 'Tầng 2, Kệ A-09' },
  { isbn: '978-0131103627', title: 'The C Programming Language', authors: ['Brian W. Kernighan', 'Dennis M. Ritchie'], publisher: 'Prentice Hall', year: 1988, category: 'Công nghệ', copies: 8, available: 6, location: 'Tầng 2, Kệ A-10' },
  { isbn: '978-0201633611', title: 'Toán cao cấp Tập 1', authors: ['Phạm Minh Triết'], publisher: 'NXB Giáo dục', year: 2015, category: 'Toán', copies: 10, available: 7, location: 'Tầng 3, Kệ B-01' },
  { isbn: '978-0201633612', title: 'Tâm lý học đại cương', authors: ['Nguyễn Văn Dũng'], publisher: 'NXB Đại học Quốc gia', year: 2018, category: 'Tâm lý', copies: 5, available: 4, location: 'Tầng 3, Kệ C-01' },
];

// ─── MAIN SEED ───────────────────────────────────────────────────────────────

async function seedAll() {
  console.log('\n════════════════════════════════════════');
  console.log('  UMS - Comprehensive Seed Script');
  console.log('════════════════════════════════════════\n');

  await connectDatabase();
  console.log('✅ Database connected\n');

  // Drop all collections for clean slate (removes old indexes too)
  console.log('🗑️  Dropping all collections for clean state...');
  const db = mongoose.connection.db!;
  const allCollections = await db.listCollections().toArray();
  for (const col of allCollections) {
    try { await db.collection(col.name).drop(); } catch { /* ignore */ }
  }
  console.log('   ✅ All collections dropped\n');

  // 1. Seed Users FIRST (needed for adminId)
  console.log('📦 [1/20] Users...');
  await User.deleteMany({});

  // Hash passwords before seeding (insertMany doesn't trigger pre-save hooks)
  const hashedUsers = await Promise.all(
    USER_DATA.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(u.password, 12),
    }))
  );
  const allUsers = await User.insertMany(hashedUsers);
  const adminId = allUsers[0]._id as mongoose.Types.ObjectId;
  const users = allUsers; // alias for backward compatibility
  const svUserIds = allUsers.slice(7).map(u => u._id as mongoose.Types.ObjectId); // sinhvien from index 7+
  console.log(`   ✅ ${allUsers.length} users`);
  console.log('   🔑 Credentials:');
  allUsers.forEach(u => console.log(`      ${u.email}`));
  console.log('');

  // 2. Departments
  console.log('📦 [2/20] Departments...');
  const depts = await Department.insertMany(DEPT_DATA.map(d => ({ ...d, createdBy: adminId })));
  const deptMap = new Map(depts.map(d => [d.code, d._id as mongoose.Types.ObjectId]));
  console.log(`   ✅ ${depts.length} departments\n`);

  // 3. VienChuc
  console.log('📦 [3/20] VienChuc...');
  const cnnttId = deptMap.get('KHOA-CNTT')!;
  const ktId = deptMap.get('KHOA-KINHTE')!;
  const spId = deptMap.get('KHOA-SUPHAM')!;
  const deptCodes = ['KHOA-CNTT', 'KHOA-KINHTE', 'KHOA-SUPHAM', 'KHOA-CNTT', 'PHONG-HC', 'PHONG-ĐT', 'PHONG-KHCN', 'PHONG-TC'];
  const vcData = VC_DATA.map((vc, i) => ({
    ...vc, department: deptMap.get(deptCodes[i % deptCodes.length]), createdBy: adminId, updatedBy: adminId,
  }));
  const vcs = await VienChuc.insertMany(vcData);
  const vcIds = vcs.map(v => v._id as mongoose.Types.ObjectId);
  console.log(`   ✅ ${vcs.length} VienChuc\n`);

  // 4. Leave Requests
  console.log('📦 [4/20] Leave Requests...');
  await LeaveRequest.deleteMany({});
  await LeaveRequest.insertMany(LEAVE_DATA.map((l, i) => ({
    ...l,
    employeeId: users[i + 4]?._id || adminId,
    employeeName: users[i + 4]?.displayName || 'GV',
    department: cnnttId,
    approver: adminId,
    approverName: 'Quản trị viên',
    approvedAt: l.status === 'approved' ? new Date() : undefined,
  })));
  console.log(`   ✅ ${LEAVE_DATA.length} leave requests\n`);

  // 5. Contracts
  console.log('📦 [5/20] Contracts...');
  await Contract.deleteMany({});
  await Contract.insertMany(CONTRACT_DATA.map((c, i) => ({
    ...c, employee: vcIds[i % vcIds.length], signedBy: adminId, createdBy: adminId, updatedBy: adminId,
  })));
  console.log(`   ✅ ${CONTRACT_DATA.length} contracts\n`);

  // 6. Subjects
  console.log('📦 [6/20] Subjects...');
  const subjectData = SUBJECT_DATA.map(s => ({ ...s, department: cnnttId }));
  const subjects = await Subject.insertMany(subjectData);
  const subjectIds = subjects.map(s => s._id as mongoose.Types.ObjectId);
  console.log(`   ✅ ${subjects.length} subjects\n`);

  // 7. Courses
  console.log('📦 [7/20] Courses...');
  const courseData = COURSE_DATA.map((c, i) => ({
    ...c,
    subject: subjectIds[i % subjectIds.length],
    lecturer: vcIds[i % vcIds.length],
    department: cnnttId,
    createdBy: adminId, updatedBy: adminId,
  }));
  const courses = await Course.insertMany(courseData);
  const courseIds = courses.map(c => c._id as mongoose.Types.ObjectId);
  console.log(`   ✅ ${courses.length} courses\n`);

  // 8. Students
  console.log('📦 [8/20] Students...');
  const studentRawData = generateStudentData([cnnttId, ktId, spId], svUserIds, adminId);
  const students = await Student.insertMany(studentRawData);
  const studentIds = students.map(s => s._id as mongoose.Types.ObjectId);
  console.log(`   ✅ ${students.length} students\n`);

  // 9. Enrollments
  console.log('📦 [9/20] Enrollments...');
  const enrollmentData = generateEnrollmentData(studentIds, courseIds, adminId);
  const enrollments = await Enrollment.insertMany(enrollmentData);
  console.log(`   ✅ ${enrollments.length} enrollments\n`);

  // 10. Curriculum
  console.log('📦 [10/20] Curriculum...');
  await Curriculum.insertMany([{
    code: 'CTĐT-CNTT-2025', name: 'Chương trình đào tạo Công nghệ Thông tin 2025',
    department: cnnttId, degreeType: 'Cử nhân' as const, durationYears: 4, totalCredits: 120,
    subjects: subjectIds.slice(0, 10).map((sid, i) => ({ subject: sid, semester: Math.floor(i / 3) + 1, isRequired: i < 8 })),
    year: 2025, status: 'active' as const,
    description: 'CTĐT đào tạo cử nhân CNTT theo chuẩn AUN-QA',
    createdBy: adminId, updatedBy: adminId,
  }]);
  console.log('   ✅ 1 curriculum\n');

  // 10b. Graduation Sessions
  console.log('📦 [10b/22] Graduation Sessions...');
  await GraduationSession.insertMany(GRADUATION_SESSION_DATA.map((s, i) => ({
    ...s, totalCandidates: i === 0 ? 15 : 0, createdBy: adminId, updatedBy: adminId,
  })));
  console.log(`   ✅ ${GRADUATION_SESSION_DATA.length} graduation sessions\n`);

  // 10c. Internships
  console.log('📦 [10c/22] Internships...');
  const internshipDeptIds = [cnnttId, ktId];
  const internshipRecords = await Promise.all(INTERNSHIP_DATA.map(async (int, i) => {
    const student = await Student.findOne({ code: int.studentCode });
    return {
      ...int,
      student: student ? student._id : undefined,
      department: internshipDeptIds[i % internshipDeptIds.length],
      createdBy: adminId,
      updatedBy: adminId,
    };
  }));
  await Internship.insertMany(internshipRecords);
  console.log(`   ✅ ${INTERNSHIP_DATA.length} internships\n`);

  // 11. Document Folders + Documents
  console.log('📦 [11/20] Documents & Folders...');
  const folders = await DocumentFolder.insertMany([
    { name: 'Quy định - Quy chế', type: 'policy', isPublic: true, createdBy: adminId },
    { name: 'Kế hoạch', type: 'plan', isPublic: true, createdBy: adminId },
    { name: 'Báo cáo', type: 'report', isPublic: false, createdBy: adminId },
    { name: 'Hợp đồng', type: 'contract', isPublic: false, createdBy: adminId },
    { name: 'Công văn', type: 'document', isPublic: true, createdBy: adminId },
  ]);
  const folderIds = folders.map(f => f._id as mongoose.Types.ObjectId);
  await DocumentModel.insertMany(DOC_DATA.map((d, i) => ({
    ...d, folder: folderIds[i % folderIds.length], author: adminId, department: cnnttId, createdBy: adminId, updatedBy: adminId,
  })));
  console.log(`   ✅ ${folders.length} folders + ${DOC_DATA.length} documents\n`);

  // 12. Tuitions
  console.log('📦 [12/20] Tuitions...');
  const tuitionData: any[] = [];
  for (let i = 0; i < Math.min(studentIds.length, 30); i++) {
    const amount = [15000000, 18000000, 20000000, 22000000][i % 4];
    const paid = i % 5 === 0 ? 0 : i % 5 === 1 ? amount * 0.5 : amount;
    const status: 'unpaid'|'partial'|'paid'|'exempt' = paid === amount ? 'paid' : paid === 0 ? 'unpaid' : 'partial';
    tuitionData.push({
      student: studentIds[i], semester: 1, academicYear: '2025-2026', amount, paidAmount: paid, status,
      dueDate: new Date('2025-09-15'),
      paidAt: status === 'paid' ? new Date('2025-08-20') : undefined,
      paymentMethod: status === 'paid' ? 'Chuyển khoản' : undefined,
      transactionCode: status === 'paid' ? `GD-${2025}${String(i + 1).padStart(6, '0')}` : undefined,
      createdBy: adminId,
    });
  }
  await Tuition.insertMany(tuitionData);
  console.log(`   ✅ ${tuitionData.length} tuitions\n`);

  // 13. Expenses + Budgets
  console.log('📦 [13/20] Expenses & Budgets...');
  await Expense.insertMany(EXPENSE_DATA.map(e => ({
    ...e, department: cnnttId,
    approvedBy: (e.status === 'paid' || e.status === 'approved') ? adminId : undefined,
    approvedAt: (e.status === 'paid' || e.status === 'approved') ? new Date() : undefined,
    createdBy: adminId,
  })));
  await Budget.insertMany([{
    code: 'NS-2025-001', name: 'Ngân sách Khoa CNTT năm 2025', year: 2025, department: cnnttId,
    totalBudget: 2000000000, allocated: 1800000000, spent: 850000000, remaining: 950000000, status: 'active' as const,
    items: [
      { category: 'Đào tạo', allocated: 800000000, spent: 400000000 },
      { category: 'NCKH', allocated: 500000000, spent: 200000000 },
      { category: 'Cơ sở vật chất', allocated: 300000000, spent: 150000000 },
      { category: 'Hành chính', allocated: 200000000, spent: 100000000 },
    ],
    createdBy: adminId,
  }]);
  console.log(`   ✅ ${EXPENSE_DATA.length} expenses + 1 budget\n`);

  // 14. Assignments
  console.log('📦 [14/20] Assignments...');
  const assignments = await Assignment.insertMany(ASSIGNMENT_DATA.map(a => ({ ...a, course: courseIds[0], createdBy: adminId })));
  const assignIds = assignments.map(a => a._id as mongoose.Types.ObjectId);
  console.log(`   ✅ ${assignments.length} assignments\n`);

  // 15. Submissions
  console.log('📦 [15/20] Submissions...');
  const subData: any[] = [];
  for (let a = 0; a < Math.min(assignIds.length, 6); a++) {
    for (let s = 0; s < Math.min(studentIds.length, 5); s++) {
      const isGraded = a < 5;
      subData.push({
        assignment: assignIds[a], student: studentIds[s],
        content: `Nộp bài tập ${a + 1}`,
        score: isGraded ? parseFloat((5 + ((a + s) * 0.7) % 5).toFixed(1)) : undefined,
        grade: isGraded ? LETTER_GRADES[Math.floor(Math.random() * LETTER_GRADES.length)] : undefined,
        feedback: isGraded ? 'Bài làm đạt yêu cầu' : undefined,
        status: isGraded ? 'graded' : 'submitted',
        submittedAt: new Date('2025-10-10'),
        gradedAt: isGraded ? new Date('2025-10-15') : undefined,
        gradedBy: isGraded ? adminId : undefined,
      });
    }
  }
  await Submission.insertMany(subData);
  console.log(`   ✅ ${subData.length} submissions\n`);

  // 16. Exams + ExamSubmissions
  console.log('📦 [16/20] Exams & ExamSubmissions...');
  const examData = EXAM_DATA.map(e => ({ ...e, course: e.code.includes('INT1001') ? courseIds[0] : e.code.includes('MATH1001') ? courseIds[6] : courseIds[1], createdBy: adminId }));
  const exams = await Exam.insertMany(examData);
  const examIds = exams.map(e => e._id as mongoose.Types.ObjectId);
  const examSubData: any[] = [];
  for (let e = 0; e < Math.min(examIds.length, 3); e++) {
    for (let s = 0; s < Math.min(studentIds.length, 5); s++) {
      const isGraded = e === 0;
      examSubData.push({
        exam: examIds[e], student: studentIds[s],
        score: isGraded ? parseFloat((4 + ((e + s) * 0.5) % 6).toFixed(1)) : undefined,
        status: isGraded ? 'graded' : 'submitted',
        submittedAt: new Date('2025-10-25'),
        gradedAt: isGraded ? new Date('2025-10-28') : undefined,
        gradedBy: isGraded ? adminId : undefined,
      });
    }
  }
  await ExamSubmission.insertMany(examSubData);
  console.log(`   ✅ ${exams.length} exams + ${examSubData.length} exam submissions\n`);

  // 17. Research Projects + KPIs
  console.log('📦 [17/20] Research & KPIs...');
  await ResearchProject.insertMany(RESEARCH_DATA.map((r, i) => ({
    ...r, leader: vcIds[i % vcIds.length], members: [adminId, vcIds[(i + 1) % vcIds.length]], createdBy: adminId,
  })));
  await KPI.insertMany(KPI_DATA);
  console.log(`   ✅ ${RESEARCH_DATA.length} research + ${KPI_DATA.length} KPIs\n`);

  // 18. KTX Rooms
  console.log('📦 [18/20] KTX Rooms...');
  await KtxRoom.insertMany(ROOM_DATA);
  console.log(`   ✅ ${ROOM_DATA.length} rooms\n`);

  // 19. QA Evidence + WMS Tasks
  console.log('📦 [19/20] QA Evidence & WMS Tasks...');
  await QaEvidence.insertMany(QA_DATA.map(q => ({ ...q, uploadedBy: adminId })));
  await WmsTask.insertMany(TASK_DATA.map(t => ({ ...t, assignee: vcIds[0], createdBy: adminId })));
  console.log(`   ✅ ${QA_DATA.length} QA evidence + ${TASK_DATA.length} WMS tasks\n`);

  // 20. Library Books + Integration Logs + OCR + DCE + PMS + PORTAL
  console.log('📦 [20/20] Library, Integration, OCR, DCE, PMS, Portal...');
  await LibBook.insertMany(BOOK_DATA);
  const now = new Date();
  await IntegrationLog.insertMany([
    { source: 'HEMIS', event: 'sync_students', payload: { count: studentIds.length }, status: 'success' as const, timestamp: new Date(now.getTime() - 3600000) },
    { source: 'VNeID', event: 'verify_citizen', payload: { id: '001234567890' }, status: 'success' as const, timestamp: new Date(now.getTime() - 7200000) },
    { source: 'CSDLVB', event: 'upload_certificate', payload: { studentId: String(studentIds[0]), certId: 'VB-2025-001' }, status: 'success' as const, timestamp: new Date(now.getTime() - 10800000) },
  ]);
  await OcrJob.insertMany([
    { code: 'OCR-2025-001', fileUrl: '/uploads/bang_diploma_01.pdf', status: 'completed' as const, extractedText: 'Bằng tốt nghiệp Đại học...', createdBy: adminId },
    { code: 'OCR-2025-002', fileUrl: '/uploads/bang_diploma_02.pdf', status: 'processing' as const, createdBy: adminId },
  ]);
  await DceCompetency.insertMany([
    { code: 'DCE-CS101', name: 'Năng lực công nghệ thông tin cơ bản', description: 'Sử dụng thành thạo máy tính và các phần mềm văn phòng', level: 1, category: 'Kỹ năng CNTT', criteria: ['Sử dụng Word', 'Sử dụng Excel', 'Sử dụng PowerPoint'], isActive: true },
    { code: 'DCE-CS201', name: 'Năng lực lập trình', description: 'Khả năng lập trình các bài toán cơ bản', level: 2, category: 'Kỹ năng chuyên môn', criteria: ['Viết chương trình', 'Debug', 'Tối ưu hóa'], isActive: true },
  ]);
  await PmsMeeting.insertMany([
    { code: 'HĐ-2025-01', title: 'Họp hội đồng khoa học tháng 1/2025', date: new Date('2025-01-15'), attendees: [adminId], content: 'Đánh giá tiến độ các đề tài NCKH', decisions: 'Gia hạn thời gian NCKH-2024-002 thêm 6 tháng', status: 'held' as const, createdBy: adminId },
    { code: 'HĐ-2025-02', title: 'Họp hội đồng khoa học tháng 4/2025', date: new Date('2025-04-20'), attendees: [adminId], content: 'Nghiệm thu đề tài cấp trường', status: 'scheduled' as const, createdBy: adminId },
  ]);
  await PortalAnnouncement.insertMany([
    { title: 'Thông báo lịch thi học kỳ 1 năm học 2025-2026', content: 'Lịch thi học kỳ 1 đã được công bố. Sinh viên vui lòng kiểm tra trên portal.', category: 'academic', priority: 'high' as const, isPublic: true, expiresAt: new Date('2026-01-31'), createdBy: adminId },
    { title: 'Đăng ký học phần học kỳ 2 năm học 2025-2026', content: 'Sinh viên đăng ký học phần từ ngày 01/12/2025 đến 15/12/2025.', category: 'academic', priority: 'high' as const, isPublic: true, expiresAt: new Date('2025-12-20'), createdBy: adminId },
    { title: 'Kết quả học tập học kỳ 1', content: 'Kết quả học tập đã được cập nhật. Sinh viên kiểm tra và phản ánh nếu có sai sót.', category: 'academic', priority: 'normal' as const, isPublic: true, expiresAt: new Date('2026-02-28'), createdBy: adminId },
    { title: 'Thông báo nghỉ Tết Dương lịch 2026', content: 'Trường nghỉ Tết Dương lịch từ ngày 01/01/2026 đến 03/01/2026.', category: 'general', priority: 'normal' as const, isPublic: true, expiresAt: new Date('2026-01-10'), createdBy: adminId },
  ]);
  console.log(`   ✅ ${BOOK_DATA.length} books + 3 integration logs + 2 OCR + 2 DCE + 2 PMS + 4 announcements`);

  // Summary
  const stats: [string, number][] = [
    ['Users', USER_DATA.length],
    ['Departments', DEPT_DATA.length],
    ['VienChuc', VC_DATA.length],
    ['Leave Requests', LEAVE_DATA.length],
    ['Contracts', CONTRACT_DATA.length],
    ['Subjects', SUBJECT_DATA.length],
    ['Courses', COURSE_DATA.length],
    ['Students', studentRawData.length],
    ['Enrollments', enrollmentData.length],
    ['Curricula', 1],
    ['Graduation Sessions', GRADUATION_SESSION_DATA.length],
    ['Internships', INTERNSHIP_DATA.length],
    ['Document Folders', folders.length],
    ['Documents', DOC_DATA.length],
    ['Tuitions', tuitionData.length],
    ['Expenses', EXPENSE_DATA.length],
    ['Budgets', 1],
    ['Assignments', ASSIGNMENT_DATA.length],
    ['Submissions', subData.length],
    ['Exams', EXAM_DATA.length],
    ['Exam Submissions', examSubData.length],
    ['Research Projects', RESEARCH_DATA.length],
    ['KPIs', KPI_DATA.length],
    ['KTX Rooms', ROOM_DATA.length],
    ['QA Evidence', QA_DATA.length],
    ['WMS Tasks', TASK_DATA.length],
    ['Library Books', BOOK_DATA.length],
    ['Integration Logs', 3],
    ['OCR Jobs', 2],
    ['DCE Competencies', 2],
    ['PMS Meetings', 2],
    ['Portal Announcements', 4],
  ];
  const maxLen = Math.max(...stats.map(([s]) => s.length));
  console.log('\n════════════════════════════════════════');
  console.log('  ✅ All seeds completed successfully!');
  console.log('════════════════════════════════════════\n');
  console.log('📊 Seed Summary:');
  stats.forEach(([name, count]) => console.log(`   ${name.padEnd(maxLen)} : ${count}`));
  const total = stats.reduce((sum, [, n]) => sum + n, 0);
  console.log(`\n   Total records: ~${total}\n`);
}

seedAll()
  .then(() => { console.log('🚀 Seed complete!\n'); process.exit(0); })
  .catch(err => { console.error('\n❌ Seed failed:', err); process.exit(1); });
