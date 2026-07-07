/**
 * Seed script — Users + VienChuc data
 * Run: npm run seed:hrm
 *
 * Data source: Based on Vietnamese university real staffing patterns.
 * Password for all seed accounts: Password@123
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { hashPassword } from '../utils/password.js';
import { User, Department, VienChuc } from '../models/index.js';
import { logger } from '../utils/logger.js';

config();

// ─── Roles map ────────────────────────────────────────────────────────────────
const ROLE = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HIEU_TRUONG: 'HIEU_TRUONG',
  PHO_HIEU_TRUONG: 'PHO_HIEU_TRUONG',
  TRUONG_KHOA: 'TRUONG_KHOA',
  GIAO_VIEN: 'GIAO_VIEN',
  NHAN_VIEN: 'NHAN_VIEN',
} as const;

const SEED_PASSWORD_HASH = ''; // Will be computed once
const DEFAULT_PASSWORD = 'Password@123';

// ─── Department code → ObjectId map ───────────────────────────────────────────
// Run seedDepartment.ts first to get these IDs, then update here.
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

function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

// ─── 20 Viên chức seed data ────────────────────────────────────────────────────
const VIEN_CHUC_SEED = [
  // 1. Ban Giám hiệu
  {
    code: 'VC-2010-001',
    name: 'GS.TS. Trần Đình Long',
    dob: new Date('1965-03-15'),
    gender: 'Nam',
    title: 'GS.TS',
    position: 'Hiệu trưởng',
    deptCode: 'BAN_THANHTra', // placeholder
    contractType: 'Cơ hữu',
    salary: 28000000,
    status: 'active' as const,
    joinDate: new Date('2010-09-01'),
    education: 'Tiến sĩ',
    major: 'Khoa học Máy tính',
    school: 'Đại học Bách Khoa TP.HCM',
    gradYear: 2005,
    languages: ['Tiếng Anh - IELTS 7.5'],
    email: 'tran.dinh.long@truong.edu.vn',
    phone: '0901xxx001',
    itLevel: 'IC3',
  },
  {
    code: 'VC-2012-002',
    name: 'PGS.TS. Nguyễn Thị Lan Hương',
    dob: new Date('1972-07-22'),
    gender: 'Nữ',
    title: 'PGS.TS',
    position: 'Phó Hiệu trưởng',
    deptCode: 'BAN_THANHTra',
    contractType: 'Cơ hữu',
    salary: 24000000,
    status: 'active' as const,
    joinDate: new Date('2012-03-15'),
    education: 'Tiến sĩ',
    major: 'Kinh tế Quản lý',
    school: 'Đại học Kinh tế TP.HCM',
    gradYear: 2010,
    languages: ['Tiếng Anh - IELTS 6.5', 'Tiếng Pháp - B2'],
    email: 'nguyen.thi.lan.huong@truong.edu.vn',
    phone: '0901xxx002',
    itLevel: 'IC3',
  },
  // 2. Trưởng khoa
  {
    code: 'VC-2015-003',
    name: 'PGS.TS. Hoàng Minh Tuấn',
    dob: new Date('1980-05-10'),
    gender: 'Nam',
    title: 'PGS.TS',
    position: 'Trưởng khoa',
    deptCode: 'KHOA_CNTT',
    contractType: 'Cơ hữu',
    salary: 21000000,
    status: 'active' as const,
    joinDate: new Date('2015-09-01'),
    education: 'Tiến sĩ',
    major: 'Khoa học Máy tính',
    school: 'Đại học Quốc gia TP.HCM',
    gradYear: 2012,
    languages: ['Tiếng Anh - IELTS 7.0'],
    email: 'hoang.minh.tuan@truong.edu.vn',
    phone: '0901xxx003',
    itLevel: 'IC3',
  },
  {
    code: 'VC-2016-004',
    name: 'TS. Lê Thị Thu Hà',
    dob: new Date('1978-11-20'),
    gender: 'Nữ',
    title: 'TS',
    position: 'Trưởng khoa',
    deptCode: 'KHOA_KINHTE',
    contractType: 'Cơ hữu',
    salary: 20000000,
    status: 'active' as const,
    joinDate: new Date('2016-09-01'),
    education: 'Tiến sĩ',
    major: 'Kinh tế',
    school: 'Đại học Kinh tế Luật TP.HCM',
    gradYear: 2014,
    languages: ['Tiếng Anh - IELTS 6.0'],
    email: 'le.thi.thu.ha@truong.edu.vn',
    phone: '0901xxx004',
    itLevel: 'IC3',
  },
  {
    code: 'VC-2017-005',
    name: 'TS. Phạm Văn Bình',
    dob: new Date('1975-02-28'),
    gender: 'Nam',
    title: 'TS',
    position: 'Trưởng khoa',
    deptCode: 'KHOA_LUAT',
    contractType: 'Cơ hữu',
    salary: 19500000,
    status: 'active' as const,
    joinDate: new Date('2017-09-01'),
    education: 'Tiến sĩ',
    major: 'Luật Học',
    school: 'Đại học Luật TP.HCM',
    gradYear: 2013,
    languages: ['Tiếng Anh - IELTS 6.5'],
    email: 'pham.van.binh@truong.edu.vn',
    phone: '0901xxx005',
    itLevel: 'IC3',
  },
  // 3. Phó trưởng khoa
  {
    code: 'VC-2018-006',
    name: 'ThS. Trần Hoàng Nam',
    dob: new Date('1982-09-05'),
    gender: 'Nam',
    title: 'ThS',
    position: 'Phó Trưởng khoa',
    deptCode: 'KHOA_CNTT',
    contractType: 'Cơ hữu',
    salary: 17500000,
    status: 'active' as const,
    joinDate: new Date('2018-03-01'),
    education: 'Thạc sĩ',
    major: 'Công nghệ Phần mềm',
    school: 'Đại học Bách Khoa TP.HCM',
    gradYear: 2016,
    languages: ['Tiếng Anh - IELTS 6.0'],
    email: 'tran.hoang.nam@truong.edu.vn',
    phone: '0901xxx006',
    itLevel: 'IC3',
  },
  {
    code: 'VC-2019-007',
    name: 'ThS. Đỗ Thị Mai Linh',
    dob: new Date('1985-04-18'),
    gender: 'Nữ',
    title: 'ThS',
    position: 'Phó Trưởng khoa',
    deptCode: 'KHOA_KINHTE',
    contractType: 'Cơ hữu',
    salary: 17000000,
    status: 'active' as const,
    joinDate: new Date('2019-09-01'),
    education: 'Thạc sĩ',
    major: 'Quản trị Kinh doanh',
    school: 'Đại học Kinh tế TP.HCM',
    gradYear: 2017,
    languages: ['Tiếng Anh - IELTS 5.5'],
    email: 'do.thi.mai.linh@truong.edu.vn',
    phone: '0901xxx007',
    itLevel: 'IC3',
  },
  // 4. Giảng viên cơ hữu
  {
    code: 'VC-2020-008',
    name: 'ThS. Nguyễn Hoàng Long',
    dob: new Date('1985-03-15'),
    gender: 'Nam',
    title: 'ThS',
    position: 'Giảng viên',
    deptCode: 'KHOA_CNTT',
    contractType: 'Cơ hữu',
    salary: 15500000,
    status: 'active' as const,
    joinDate: new Date('2020-09-01'),
    education: 'Thạc sĩ',
    major: 'Khoa học Máy tính',
    school: 'Đại học Bách Khoa TP.HCM',
    gradYear: 2019,
    languages: ['Tiếng Anh - IELTS 6.0'],
    email: 'nguyen.hoang.long@truong.edu.vn',
    phone: '0901xxx008',
    itLevel: 'IC3',
  },
  {
    code: 'VC-2020-009',
    name: 'ThS. Trần Thị Mai Lan',
    dob: new Date('1990-07-22'),
    gender: 'Nữ',
    title: 'ThS',
    position: 'Giảng viên',
    deptCode: 'KHOA_KINHTE',
    contractType: 'Cơ hữu',
    salary: 15000000,
    status: 'active' as const,
    joinDate: new Date('2020-09-01'),
    education: 'Thạc sĩ',
    major: 'Kế toán',
    school: 'Đại học Kinh tế TP.HCM',
    gradYear: 2018,
    languages: ['Tiếng Anh - TOEIC 750'],
    email: 'tran.thi.mai.lan@truong.edu.vn',
    phone: '0901xxx009',
    itLevel: 'IC3',
  },
  {
    code: 'VC-2021-010',
    name: 'ThS. Lê Văn Minh',
    dob: new Date('1992-11-08'),
    gender: 'Nam',
    title: 'ThS',
    position: 'Giảng viên',
    deptCode: 'KHOA_LUAT',
    contractType: 'Cơ hữu',
    salary: 14500000,
    status: 'active' as const,
    joinDate: new Date('2021-03-01'),
    education: 'Thạc sĩ',
    major: 'Luật Thương mại',
    school: 'Đại học Luật Hà Nội',
    gradYear: 2020,
    languages: ['Tiếng Anh - IELTS 6.0'],
    email: 'le.van.minh@truong.edu.vn',
    phone: '0901xxx010',
    itLevel: 'IC3',
  },
  {
    code: 'VC-2021-011',
    name: 'ThS. Phạm Thị Hương Giang',
    dob: new Date('1993-08-25'),
    gender: 'Nữ',
    title: 'ThS',
    position: 'Giảng viên',
    deptCode: 'KHOA_NN',
    contractType: 'Cơ hữu',
    salary: 14200000,
    status: 'active' as const,
    joinDate: new Date('2021-09-01'),
    education: 'Thạc sĩ',
    major: 'Ngôn ngữ Anh',
    school: 'Đại học Sư phạm TP.HCM',
    gradYear: 2020,
    languages: ['Tiếng Anh - IELTS 7.5', 'Tiếng Nhật - N3'],
    email: 'pham.thi.huong.giang@truong.edu.vn',
    phone: '0901xxx011',
    itLevel: 'IC3',
  },
  // 5. Giảng viên thỉnh giảng
  {
    code: 'VC-2022-012',
    name: 'PGS.TS. Vũ Đình Hùng',
    dob: new Date('1968-12-03'),
    gender: 'Nam',
    title: 'PGS.TS',
    position: 'Giảng viên',
    deptCode: 'KHOA_KHXD',
    contractType: 'Thỉnh giảng',
    salary: 12000000,
    status: 'active' as const,
    joinDate: new Date('2022-09-01'),
    education: 'Tiến sĩ',
    major: 'Kỹ thuật Xây dựng',
    school: 'Đại học Xây dựng Hà Nội',
    gradYear: 2000,
    languages: ['Tiếng Anh - IELTS 6.5'],
    email: 'vu.dinh.hung@truong.edu.vn',
    phone: '0901xxx012',
    itLevel: 'IC3',
  },
  // 6. Thử việc
  {
    code: 'VC-2025-013',
    name: 'CN. Đặng Thị Ngọc Anh',
    dob: new Date('2001-06-15'),
    gender: 'Nữ',
    title: 'Cử nhân',
    position: 'Giảng viên',
    deptCode: 'KHOA_CNTT',
    contractType: 'Thử việc',
    salary: 9800000,
    status: 'trial' as const,
    joinDate: new Date('2025-09-01'),
    education: 'Cử nhân',
    major: 'Công nghệ Thông tin',
    school: 'Đại học Công nghệ TP.HCM',
    gradYear: 2025,
    languages: ['Tiếng Anh - IELTS 5.5'],
    email: 'dang.thi.ngoc.anh@truong.edu.vn',
    phone: '0901xxx013',
    itLevel: 'IC3',
  },
  {
    code: 'VC-2025-014',
    name: 'ThS. Bùi Hoàng Sơn',
    dob: new Date('1996-01-30'),
    gender: 'Nam',
    title: 'ThS',
    position: 'Giảng viên',
    deptCode: 'KHOA_DIENTU',
    contractType: 'Thử việc',
    salary: 10500000,
    status: 'trial' as const,
    joinDate: new Date('2025-03-01'),
    education: 'Thạc sĩ',
    major: 'Kỹ thuật Điện tử',
    school: 'Đại học Bách Khoa TP.HCM',
    gradYear: 2024,
    languages: ['Tiếng Anh - IELTS 6.0'],
    email: 'bui.hoang.son@truong.edu.vn',
    phone: '0901xxx014',
    itLevel: 'IC3',
  },
  // 7. Nhân viên phòng ban
  {
    code: 'VC-2019-015',
    name: 'CN. Nguyễn Thị Thu Hằng',
    dob: new Date('1990-05-20'),
    gender: 'Nữ',
    title: 'Cử nhân',
    position: 'Chuyên viên',
    deptCode: 'P_TOCHUC',
    contractType: 'Cơ hữu',
    salary: 10500000,
    status: 'active' as const,
    joinDate: new Date('2019-03-01'),
    education: 'Cử nhân',
    major: 'Quản trị Nhân lực',
    school: 'Đại học Kinh tế TP.HCM',
    gradYear: 2018,
    languages: ['Tiếng Anh - TOEIC 650'],
    email: 'nguyen.thi.thu.hang@truong.edu.vn',
    phone: '0901xxx015',
    itLevel: 'IC3',
  },
  {
    code: 'VC-2020-016',
    name: 'ThS. Hoàng Thị Lan',
    dob: new Date('1992-09-12'),
    gender: 'Nữ',
    title: 'ThS',
    position: 'Chuyên viên',
    deptCode: 'P_DAOTAO',
    contractType: 'Cơ hữu',
    salary: 11200000,
    status: 'active' as const,
    joinDate: new Date('2020-03-01'),
    education: 'Thạc sĩ',
    major: 'Sư phạm',
    school: 'Đại học Sư phạm TP.HCM',
    gradYear: 2019,
    languages: ['Tiếng Anh - TOEIC 700'],
    email: 'hoang.thi.lan@truong.edu.vn',
    phone: '0901xxx016',
    itLevel: 'IC3',
  },
  {
    code: 'VC-2021-017',
    name: 'CN. Đặng Văn Minh',
    dob: new Date('1995-03-08'),
    gender: 'Nam',
    title: 'Cử nhân',
    position: 'Nhân viên',
    deptCode: 'P_TAICHINH',
    contractType: 'Cơ hữu',
    salary: 9800000,
    status: 'active' as const,
    joinDate: new Date('2021-09-01'),
    education: 'Cử nhân',
    major: 'Kế toán',
    school: 'Đại học Kinh tế TP.HCM',
    gradYear: 2020,
    languages: ['Tiếng Anh - TOEIC 600'],
    email: 'dang.van.minh@truong.edu.vn',
    phone: '0901xxx017',
    itLevel: 'IC3',
  },
  {
    code: 'VC-2022-018',
    name: 'ThS. Lý Thị Thu Trang',
    dob: new Date('1994-07-30'),
    gender: 'Nữ',
    title: 'ThS',
    position: 'Chuyên viên',
    deptCode: 'P_KHTH',
    contractType: 'Cơ hữu',
    salary: 11500000,
    status: 'active' as const,
    joinDate: new Date('2022-03-01'),
    education: 'Thạc sĩ',
    major: 'Sư phạm Toán',
    school: 'Đại học Sư phạm TP.HCM',
    gradYear: 2021,
    languages: ['Tiếng Anh - IELTS 6.0'],
    email: 'ly.thi.thu.trang@truong.edu.vn',
    phone: '0901xxx018',
    itLevel: 'IC3',
  },
  {
    code: 'VC-2023-019',
    name: 'CN. Phạm Hoàng Phi',
    dob: new Date('1998-11-22'),
    gender: 'Nam',
    title: 'Cử nhân',
    position: 'Nhân viên',
    deptCode: 'P_HCQT',
    contractType: 'Cơ hữu',
    salary: 9000000,
    status: 'active' as const,
    joinDate: new Date('2023-09-01'),
    education: 'Cử nhân',
    major: 'Quản trị Văn phòng',
    school: 'Đại học Mở TP.HCM',
    gradYear: 2022,
    languages: ['Tiếng Anh - TOEIC 550'],
    email: 'pham.hoang.phi@truong.edu.vn',
    phone: '0901xxx019',
    itLevel: 'IC3',
  },
  {
    code: 'VC-2023-020',
    name: 'ThS. Nguyễn Thị Minh Thư',
    dob: new Date('1997-04-14'),
    gender: 'Nữ',
    title: 'ThS',
    position: 'Cán bộ phân công',
    deptCode: 'P_DAOTAO',
    contractType: 'Cơ hữu',
    salary: 12000000,
    status: 'leave' as const, // Đang nghỉ phép
    joinDate: new Date('2023-03-01'),
    education: 'Thạc sĩ',
    major: 'Khoa học Giáo dục',
    school: 'Đại học Sư phạm TP.HCM',
    gradYear: 2022,
    languages: ['Tiếng Anh - IELTS 6.5'],
    email: 'nguyen.thi.minh.thu@truong.edu.vn',
    phone: '0901xxx020',
    itLevel: 'IC3',
  },
];

// ─── Users to create ─────────────────────────────────────────────────────────────
const USERS_SEED = [
  {
    email: 'admin@truong.edu.vn',
    username: 'admin',
    displayName: 'Quản trị viên Hệ thống',
    role: ROLE.SUPER_ADMIN,
    deptCode: 'P_TOCHUC',
  },
  {
    email: 'tran.dinh.long@truong.edu.vn',
    username: 'hieutruong',
    displayName: 'GS.TS. Trần Đình Long',
    role: ROLE.HIEU_TRUONG,
    deptCode: 'BAN_THANHTra',
  },
  {
    email: 'nguyen.thi.lan.huong@truong.edu.vn',
    username: 'phohieutruong',
    displayName: 'PGS.TS. Nguyễn Thị Lan Hương',
    role: ROLE.PHO_HIEU_TRUONG,
    deptCode: 'BAN_THANHTra',
  },
  {
    email: 'hoang.minh.tuan@truong.edu.vn',
    username: 'truongkhoacntt',
    displayName: 'PGS.TS. Hoàng Minh Tuấn',
    role: ROLE.TRUONG_KHOA,
    deptCode: 'KHOA_CNTT',
  },
  {
    email: 'le.thi.thu.ha@truong.edu.vn',
    username: 'truongkhoakt',
    displayName: 'TS. Lê Thị Thu Hà',
    role: ROLE.TRUONG_KHOA,
    deptCode: 'KHOA_KINHTE',
  },
  {
    email: 'nguyen.hoang.long@truong.edu.vn',
    username: 'gv.nguyenhoanglong',
    displayName: 'ThS. Nguyễn Hoàng Long',
    role: ROLE.GIAO_VIEN,
    deptCode: 'KHOA_CNTT',
  },
  {
    email: 'tran.thi.mai.lan@truong.edu.vn',
    username: 'gv.tranthimailan',
    displayName: 'ThS. Trần Thị Mai Lan',
    role: ROLE.GIAO_VIEN,
    deptCode: 'KHOA_KINHTE',
  },
  {
    email: 'hoang.thi.lan@truong.edu.vn',
    username: 'nv.hoangthilan',
    displayName: 'ThS. Hoàng Thị Lan',
    role: ROLE.NHAN_VIEN,
    deptCode: 'P_DAOTAO',
  },
];

/**
 * Seed HRM data (Users + VienChuc).
 * Does NOT connect/disconnect — caller manages the connection.
 */
export async function seedHrm() {

    // ─── 1. Clear existing data ────────────────────────────────────────────────
    await Promise.all([User.deleteMany({}), VienChuc.deleteMany({})]);
    logger.info('Cleared existing users and vienChuc');

    // ─── 2. Get department ObjectIds ────────────────────────────────────────────
    const departments = await Department.find({});
    const deptMap = departments.reduce(
      (acc, d) => {
        acc[d.code] = d._id;
        return acc;
      },
      {} as Record<string, mongoose.Types.ObjectId>
    );

    if (Object.keys(deptMap).length === 0) {
      logger.error('No departments found. Run seedDepartment.ts first!');
      process.exit(1);
    }

    logger.info(`Found ${departments.length} departments`);

    // ─── 3. Seed VienChuc ───────────────────────────────────────────────────────
    const passwordHash = await hashPassword(DEFAULT_PASSWORD);
    const createdVienChuc: any[] = [];

    for (const vc of VIEN_CHUC_SEED) {
      const deptId = deptMap[vc.deptCode];
      const created = await VienChuc.create({
        code: vc.code,
        name: vc.name,
        dob: vc.dob,
        gender: vc.gender,
        title: vc.title,
        position: vc.position,
        department: deptId || undefined,
        contractType: vc.contractType,
        salary: vc.salary,
        status: vc.status,
        joinDate: vc.joinDate,
        education: vc.education,
        major: vc.major,
        school: vc.school,
        gradYear: vc.gradYear,
        languages: vc.languages,
        email: vc.email,
        phone: vc.phone,
        itLevel: vc.itLevel,
      });
      createdVienChuc.push(created);
    }

    logger.info(`✅ Seeded ${createdVienChuc.length} VienChuc records`);

    // ─── 4. Seed Users ─────────────────────────────────────────────────────────
    const createdUsers: any[] = [];

    for (const userData of USERS_SEED) {
      const deptId = deptMap[userData.deptCode];
      const user = await User.create({
        email: userData.email,
        username: userData.username,
        password: passwordHash,
        displayName: userData.displayName,
        role: userData.role,
        department: deptId || undefined,
        status: 'active',
        mfaEnabled: 'disabled',
        permissions: [],
        failedLoginAttempts: 0,
      });
      createdUsers.push(user);
    }

    logger.info(`✅ Seeded ${createdUsers.length} Users`);

    // ─── 5. Summary ─────────────────────────────────────────────────────────────
    console.log('\n✅ HRM seed complete!');
    console.log(`   Default password for all accounts: ${DEFAULT_PASSWORD}`);
    console.log(`   VienChuc records: ${createdVienChuc.length}`);
    console.log(`   User accounts: ${createdUsers.length}`);
    console.log('\nLogin credentials:');
    for (const u of createdUsers) {
      console.log(`   ${u.role.padEnd(20)} | ${u.username.padEnd(25)} | ${u.email}`);
    }
  }
