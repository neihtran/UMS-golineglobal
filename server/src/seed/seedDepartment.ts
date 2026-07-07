/**
 * Seed script — Department data
 * Run: npm run seed:departments
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Department } from '../models/Department.js';
import { logger } from '../utils/logger.js';

config();

const DEPARTMENTS = [
  // ─── Khoa (Faculties) ─────────────────────────────────────────────────────────
  { code: 'KHOA_CNTT', name: 'Khoa Công nghệ Thông tin', shortName: 'CNTT', type: 'faculty' },
  { code: 'KHOA_KINHTE', name: 'Khoa Kinh tế & Quản trị', shortName: 'KT-QT', type: 'faculty' },
  { code: 'KHOA_LUAT', name: 'Khoa Luật', shortName: 'Luật', type: 'faculty' },
  { code: 'KHOA_NN', name: 'Khoa Ngoại ngữ', shortName: 'NN', type: 'faculty' },
  { code: 'KHOA_KHXD', name: 'Khoa Kỹ thuật Xây dựng', shortName: 'KTXD', type: 'faculty' },
  { code: 'KHOA_DIENTU', name: 'Khoa Điện — Điện tử', shortName: 'Đ-ĐT', type: 'faculty' },
  { code: 'KHOA_COKHI', name: 'Khoa Cơ khí', shortName: 'CK', type: 'faculty' },
  { code: 'KHOA_MOITRUONG', name: 'Khoa Môi trường', shortName: 'MT', type: 'faculty' },
  // ─── Phòng ban ─────────────────────────────────────────────────────────────
  { code: 'P_TOCHUC', name: 'Phòng Tổ chức — Nhân sự', shortName: 'P.TCHC', type: 'department' },
  { code: 'P_DAOTAO', name: 'Phòng Đào tạo', shortName: 'P.ĐT', type: 'department' },
  { code: 'P_TAICHINH', name: 'Phòng Tài chính — Kế toán', shortName: 'P.TCKT', type: 'department' },
  { code: 'P_KHCN', name: 'Phòng Khoa học & Công nghệ', shortName: 'P.KHCN', type: 'department' },
  { code: 'P_HCQT', name: 'Phòng Hành chính — Quản trị', shortName: 'P.HCQT', type: 'department' },
  { code: 'P_KHTH', name: 'Phòng Khảo thí & Đảm bảo Chất lượng', shortName: 'P.KTĐBCL', type: 'department' },
  { code: 'P_CTSV', name: 'Phòng Công tác Sinh viên', shortName: 'P.CTSV', type: 'department' },
  { code: 'P_QHMT', name: 'Phòng Quốc tế & Hợp tác', shortName: 'P.QT&HT', type: 'department' },
  // ─── Trung tâm ─────────────────────────────────────────────────────────────
  { code: 'TT_TTTN', name: 'Trung tâm Tư vấn Tuyển sinh', shortName: 'TT.TTS', type: 'center' },
  { code: 'TT_THTT', name: 'Trung tâm Tin học Thực hành', shortName: 'TT.THTH', type: 'center' },
  { code: 'TT_THUDIEN', name: 'Trung tâm Thư viện', shortName: 'TT.TV', type: 'center' },
  { code: 'TT_DLVN', name: 'Trung tâm Đào tạo Liên tục', shortName: 'TT.ĐTLT', type: 'center' },
  // ─── Viện + Ban ────────────────────────────────────────────────────────────
  { code: 'VIEN_NCKH', name: 'Viện Nghiên cứu Khoa học', shortName: 'Viện NCKH', type: 'institute' },
  { code: 'BAN_THANHTra', name: 'Ban Thanh tra — Giám sát', shortName: 'Ban TTGS', type: 'office' },
  { code: 'BAN_CTDLSV', name: 'Ban Công tác Đoàn thể — Sinh viên', shortName: 'Ban CTĐT-SV', type: 'office' },
];

/**
 * Seed departments. Does NOT connect/disconnect — caller manages the connection.
 */
export async function seedDepartments() {
  await Department.deleteMany({});
  logger.info('Cleared existing departments');

  const created = await Department.insertMany(DEPARTMENTS.map((d) => ({ ...d, isActive: true })));
  logger.info(`✅ Seeded ${created.length} departments`);
}
