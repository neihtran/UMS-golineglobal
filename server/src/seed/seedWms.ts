/**
 * Seed script — WMS (Quản lý Công việc) data
 * Run: npm run seed:wms
 *
 * Requires: seedHrm() already run (for staff references).
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Department, VienChuc, Project, Task } from '../models/index.js';
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
  VIEN_NCKH: 'DEPT_NCKH_ID',
  BAN_THANHTra: 'DEPT_TTGS_ID',
  BAN_CTDLSV: 'DEPT_CTDLSV_ID',
};

const PROJECTS: Array<Record<string, unknown>> = [
  { name: 'Nâng cấp Hệ thống Thông tin Quản lý Đào tạo', code: 'PRJ-DMS-001', status: 'active', department: 'KHOA_CNTT', priority: 'high', startDate: '2025-01-15', endDate: '2025-12-31', budget: 500000000 },
  { name: 'Triển khai Hệ thống Quản lý Tài chính', code: 'PRJ-FIN-001', status: 'active', department: 'P_TAICHINH', priority: 'high', startDate: '2025-02-01', endDate: '2025-10-31', budget: 300000000 },
  { name: 'Xây dựng Cổng thông tin Sinh viên', code: 'PRJ-PORTAL-001', status: 'active', department: 'P_DAOTAO', priority: 'medium', startDate: '2025-03-01', endDate: '2025-09-30', budget: 200000000 },
  { name: 'Phát triển Module Khảo thí Trực tuyến', code: 'PRJ-EXAM-001', status: 'planning', department: 'P_KHTH', priority: 'medium', startDate: '2025-06-01', endDate: '2026-01-31', budget: 250000000 },
  { name: 'Nâng cấp Hạ tầng Wi-Fi Ký túc xá', code: 'PRJ-KTX-001', status: 'active', department: 'P_CTSV', priority: 'medium', startDate: '2025-01-01', endDate: '2025-06-30', budget: 150000000 },
  { name: 'Xây dựng Thư viện Số', code: 'PRJ-LIB-001', status: 'on_hold', department: 'TT_THUDIEN', priority: 'low', startDate: '2025-07-01', endDate: '2026-03-31', budget: 180000000 },
  { name: 'Chuyển đổi số Nghiên cứu Khoa học', code: 'PRJ-RIT-001', status: 'planning', department: 'VIEN_NCKH', priority: 'medium', startDate: '2025-08-01', endDate: '2026-06-30', budget: 220000000 },
];

const TASKS: Array<Record<string, unknown>> = [
  // PRJ-DMS-001
  { projectCode: 'PRJ-DMS-001', title: 'Phân tích yêu cầu Module Đào tạo', priority: 'high', status: 'done', assignee: 'Nguyễn Hoàng Long', assigneeId: 'VC-2020-008', progress: 100 },
  { projectCode: 'PRJ-DMS-001', title: 'Thiết kế Database Schema', priority: 'high', status: 'done', assignee: 'Trần Hoàng Nam', assigneeId: 'VC-2018-006', progress: 100 },
  { projectCode: 'PRJ-DMS-001', title: 'Xây dựng API danh sách Sinh viên', priority: 'high', status: 'done', assignee: 'Nguyễn Hoàng Long', assigneeId: 'VC-2020-008', progress: 100 },
  { projectCode: 'PRJ-DMS-001', title: 'Xây dựng API quản lý Môn học', priority: 'medium', status: 'done', assignee: 'Đặng Thị Ngọc Anh', assigneeId: 'VC-2025-013', progress: 100 },
  { projectCode: 'PRJ-DMS-001', title: 'Xây dựng frontend StudentList', priority: 'high', status: 'in_progress', assignee: 'Đặng Thị Ngọc Anh', assigneeId: 'VC-2025-013', progress: 70 },
  { projectCode: 'PRJ-DMS-001', title: 'Xây dựng frontend SubjectList', priority: 'medium', status: 'in_progress', assignee: 'Bùi Hoàng Sơn', assigneeId: 'VC-2025-014', progress: 50 },
  // PRJ-FIN-001
  { projectCode: 'PRJ-FIN-001', title: 'Thiết kế Module Học phí', priority: 'high', status: 'done', assignee: 'Trần Thị Mai Lan', assigneeId: 'VC-2020-009', progress: 100 },
  { projectCode: 'PRJ-FIN-001', title: 'Tích hợp thanh toán online', priority: 'high', status: 'in_progress', assignee: 'Lê Văn Minh', assigneeId: 'VC-2021-010', progress: 60 },
  { projectCode: 'PRJ-FIN-001', title: 'Báo cáo thu chi Tổng hợp', priority: 'medium', status: 'todo', assignee: 'Trần Thị Mai Lan', assigneeId: 'VC-2020-009', progress: 0 },
  // PRJ-PORTAL-001
  { projectCode: 'PRJ-PORTAL-001', title: 'Thiết kế giao diện Cổng thông tin', priority: 'medium', status: 'done', assignee: 'Lê Văn Minh', assigneeId: 'VC-2021-010', progress: 100 },
  { projectCode: 'PRJ-PORTAL-001', title: 'Xây dựng Module Thông báo', priority: 'medium', status: 'in_progress', assignee: 'Nguyễn Thị Thu Hằng', assigneeId: 'VC-2019-015', progress: 40 },
  // PRJ-EXAM-001
  { projectCode: 'PRJ-EXAM-001', title: 'Thiết kế Module Thi trực tuyến', priority: 'high', status: 'todo', assignee: 'Hoàng Thị Lan', assigneeId: 'VC-2020-016', progress: 0 },
  { projectCode: 'PRJ-EXAM-001', title: 'Nghiên cứu anti-cheat', priority: 'high', status: 'todo', assignee: 'Nguyễn Hoàng Long', assigneeId: 'VC-2020-008', progress: 0 },
  // PRJ-KTX-001
  { projectCode: 'PRJ-KTX-001', title: 'Tích hợp hệ thống Kiểm soát Ra vào', priority: 'medium', status: 'in_progress', assignee: 'Đặng Văn Minh', assigneeId: 'VC-2021-017', progress: 55 },
  { projectCode: 'PRJ-KTX-001', title: 'Tự động hóa tính phí KTX', priority: 'medium', status: 'todo', assignee: 'Lý Thị Thu Trang', assigneeId: 'VC-2022-018', progress: 0 },
  // PRJ-LIB-001
  { projectCode: 'PRJ-LIB-001', title: 'Tích hợp catalog quốc gia', priority: 'low', status: 'todo', assignee: 'Nguyễn Thị Minh Thư', assigneeId: 'VC-2023-020', progress: 10 },
  // PRJ-RIT-001
  { projectCode: 'PRJ-RIT-001', title: 'Nghiên cứu ứng dụng AI trong NCKH', priority: 'medium', status: 'todo', assignee: 'Vũ Đình Hùng', assigneeId: 'VC-2022-012', progress: 0 },
  { projectCode: 'PRJ-RIT-001', title: 'Xây dựng Hệ thống quản lý Đề tài', priority: 'high', status: 'todo', assignee: 'Trần Hoàng Nam', assigneeId: 'VC-2018-006', progress: 0 },
  // Standalone tasks
  { projectCode: '', title: 'Nâng cấp server Mail server', priority: 'medium', status: 'todo', assignee: 'Phạm Hoàng Phi', assigneeId: 'VC-2023-019', progress: 0 },
  { projectCode: '', title: 'Bảo trì định kỳ Hệ thống Backup', priority: 'medium', status: 'todo', assignee: 'Hoàng Thị Lan', assigneeId: 'VC-2020-016', progress: 0 },
  { projectCode: '', title: 'Cập nhật trình độ CNTT cho CBGV', priority: 'low', status: 'todo', assignee: 'Lý Thị Thu Trang', assigneeId: 'VC-2022-018', progress: 0 },
  { projectCode: '', title: 'Kiểm tra an ninh mạng định kỳ', priority: 'high', status: 'in_progress', assignee: 'Nguyễn Hoàng Long', assigneeId: 'VC-2020-008', progress: 30 },
  { projectCode: '', title: 'Tổ chức workshop Digital Transformation', priority: 'medium', status: 'todo', assignee: 'Đặng Văn Minh', assigneeId: 'VC-2021-017', progress: 0 },
];

export async function seedWms() {
  await Promise.all([Project.deleteMany({}), Task.deleteMany({})]);
  logger.info('Cleared existing WMS data');

  const vienChucList = await VienChuc.find({});
  const vcMap = new Map(vienChucList.map(v => [v.code, v._id.toString()]));
  const deptIds: Record<string, string> = {};
  const departments = await Department.find({});
  departments.forEach(d => { deptIds[d.code] = d._id.toString(); });

  const projectCodeMap = new Map<string, string>();
  const createdProjects = await Project.insertMany(PROJECTS.map(p => ({
    ...p,
    department: deptIds[p.department as string],
  })));
  createdProjects.forEach((p) => { projectCodeMap.set((p as { code: string }).code, p._id.toString()); });
  logger.info(`✅ Seeded ${createdProjects.length} projects`);

  const createdTasks = await Task.insertMany(TASKS.map(t => {
    const projectId = t.projectCode ? projectCodeMap.get(t.projectCode as string) : undefined;
    return {
      ...t,
      projectId,
      dueDate: t.status !== 'todo' ? new Date(Date.now() + (30 + Math.floor(Math.random() * 60)) * 86400000) : undefined,
      startDate: t.status !== 'todo' ? new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000) : undefined,
      estimatedHours: 8 + Math.floor(Math.random() * 40),
      tags: t.projectCode ? [t.projectCode, 'dự án'] : ['công việc riêng'],
    };
  }));
  logger.info(`✅ Seeded ${createdTasks.length} tasks`);

  console.log('\n✅ WMS seed complete!');
  console.log(`   Projects: ${createdProjects.length}`);
  console.log(`   Tasks: ${createdTasks.length}`);
}

// Run directly when executed as script
const isMain = process.argv[1]?.endsWith('seedWms.ts') || process.argv[1]?.endsWith('seedWms.js');
if (isMain) {
  (async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/ums_db');
      await seedWms();
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      console.error('❌ seedWms failed:', e);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    }
  })();
}
