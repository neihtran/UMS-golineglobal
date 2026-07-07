/**
 * Seed script — DMS (Văn bản Điện tử) data
 * Run: npm run seed:dms
 *
 * Requires: seedDepartments() already run.
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Department, DocumentCategory, Document, ApprovalFlow } from '../models/index.js';
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

const CATEGORIES: Array<Record<string, unknown>> = [
  { name: 'Quy chế - Quy định', code: 'QC', description: 'Các quy chế, quy định nội bộ', color: '#2563eb' },
  { name: 'Thông báo', code: 'TB', description: 'Thông báo nội bộ', color: '#16a34a' },
  { name: 'Công văn Đi', code: 'CVD', description: 'Công văn gửi đi', color: '#dc2626' },
  { name: 'Công văn Đến', code: 'CVN', description: 'Công văn nhận được', color: '#9333ea' },
  { name: 'Hợp đồng', code: 'HD', description: 'Hợp đồng lao động, thuê mướn', color: '#ea580c' },
  { name: 'Kế hoạch', code: 'KH', description: 'Kế hoạch năm học, quý, tháng', color: '#0891b2' },
  { name: 'Báo cáo', code: 'BC', description: 'Báo cáo định kỳ, đột xuất', color: '#be185d' },
  { name: 'Biên bản', code: 'BB', description: 'Biên bản họp, nghiệm thu', color: '#4b5563' },
];

const DEPT_CODE_MAP: Record<string, string> = {
  KHOA_CNTT: 'Khoa CNTT',
  KHOA_KINHTE: 'Khoa KT-QT',
  KHOA_LUAT: 'Khoa Luật',
  P_DAOTAO: 'Phòng Đào tạo',
  P_TAICHINH: 'Phòng TC-KT',
  P_TOCHUC: 'Phòng TCHC',
  P_KHCN: 'Phòng KHCN',
  P_CTSV: 'Phòng CTSV',
};

const DOCUMENTS: Array<Record<string, unknown>> = [
  { title: 'Quy chế Đào tạo Đại học 2024', documentNumber: 'QC-DT-2024-001', deptCode: 'P_DAOTAO', status: 'published', urgency: 'normal', security: 'internal' },
  { title: 'Thông báo tuyển sinh 2025', documentNumber: 'TB-TS-2025-001', deptCode: 'TT_TTTN', status: 'published', urgency: 'urgent', security: 'public' },
  { title: 'Kế hoạch năm học 2025-2026', documentNumber: 'KH-2025-2026', deptCode: 'P_DAOTAO', status: 'approved', urgency: 'normal', security: 'internal' },
  { title: 'Quyết định bổ nhiệm Giảng viên', documentNumber: 'QD-BN-2025-003', deptCode: 'P_TOCHUC', status: 'approved', urgency: 'normal', security: 'internal' },
  { title: 'Công văn phúc đáp Bộ GD&ĐT', documentNumber: 'CVD-2025-001', deptCode: 'P_HCQT', status: 'pending_approval', urgency: 'very_urgent', security: 'confidential' },
  { title: 'Hợp đồng lao động GS.TS. Trần Đình Long', documentNumber: 'HD-LD-2024-001', deptCode: 'P_TOCHUC', status: 'published', urgency: 'normal', security: 'confidential' },
  { title: 'Biên bản nghiệm thu Đồ án tốt nghiệp', documentNumber: 'BB-NT-2025-001', deptCode: 'KHOA_CNTT', status: 'draft', urgency: 'normal', security: 'internal' },
  { title: 'Báo cáo tự đánh giá 2024', documentNumber: 'BC-TDGT-2024', deptCode: 'P_KHTH', status: 'published', urgency: 'urgent', security: 'internal' },
  { title: 'Quy định xét thăng hạng chức danh', documentNumber: 'QC-TH-2025', deptCode: 'P_KHCN', status: 'reviewing', urgency: 'normal', security: 'internal' },
  { title: 'Kế hoạch khảo thí HK2 2024-2025', documentNumber: 'KH-KT-2025-02', deptCode: 'P_KHTH', status: 'published', urgency: 'urgent', security: 'public' },
  { title: 'Thông báo nghỉ Tết Nguyên đán', documentNumber: 'TB-NT-2025', deptCode: 'P_HCQT', status: 'published', urgency: 'urgent', security: 'public' },
  { title: 'Hợp đồng thuê phòng họp', documentNumber: 'HD-TPH-2025-001', deptCode: 'P_HCQT', status: 'draft', urgency: 'normal', security: 'internal' },
  { title: 'Công văn hợp tác ĐHQG-HCM', documentNumber: 'CVD-HT-2025-001', deptCode: 'P_QHMT', status: 'approved', urgency: 'normal', security: 'internal' },
  { title: 'Biên bản họp Hội đồng Khoa học', documentNumber: 'BB-HĐKH-2025-01', deptCode: 'P_KHCN', status: 'pending_approval', urgency: 'normal', security: 'internal' },
  { title: 'Quy chế đánh giá hoạt động KHCN', documentNumber: 'QC-DGKH-2025', deptCode: 'P_KHCN', status: 'draft', urgency: 'normal', security: 'internal' },
  { title: 'Thông báo tuyển dụng Giảng viên', documentNumber: 'TB-TD-2025-001', deptCode: 'P_TOCHUC', status: 'published', urgency: 'normal', security: 'public' },
  { title: 'Kế hoạch NCKH 2025', documentNumber: 'KH-NCKH-2025', deptCode: 'VIEN_NCKH', status: 'approved', urgency: 'normal', security: 'internal' },
  { title: 'Báo cáo quyết toán năm 2024', documentNumber: 'BC-QT-2024', deptCode: 'P_TAICHINH', status: 'pending_approval', urgency: 'normal', security: 'confidential' },
];

const APPROVAL_FLOWS: Array<Record<string, unknown>> = [
  { name: 'Phê duyệt Quy chế Đào tạo', documentType: 'Quy chế', steps: 4, approverRole: 'HIỆU_TRƯỞNG' },
  { name: 'Phê duyệt Thông báo', documentType: 'Thông báo', steps: 2, approverRole: 'PHÓ_HIỆU_TRƯỞNG' },
  { name: 'Phê duyệt Hợp đồng', documentType: 'Hợp đồng', steps: 3, approverRole: 'HIỆU_TRƯỞNG' },
  { name: 'Phê duyệt Báo cáo', documentType: 'Báo cáo', steps: 3, approverRole: 'TRƯỞNG_KHOA' },
];

export async function seedDms() {
  await Promise.all([DocumentCategory.deleteMany({}), Document.deleteMany({}), ApprovalFlow.deleteMany({})]);
  logger.info('Cleared existing DMS data');

  const departments = await Department.find({});
  const deptMap = new Map(departments.map(d => [d.code, d._id.toString()]));

  const createdCategories = await DocumentCategory.insertMany(CATEGORIES.map(c => ({ ...c, isActive: true })));
  logger.info(`✅ Seeded ${createdCategories.length} document categories`);

  const createdFlows = await ApprovalFlow.insertMany(APPROVAL_FLOWS);
  logger.info(`✅ Seeded ${createdFlows.length} approval flows`);

  const createdDocs = await Document.insertMany(DOCUMENTS.map((d, i) => {
    const deptId = deptMap.get(d.deptCode as string);
    const category = createdCategories[i % createdCategories.length];
    return {
      ...d,
      categoryId: category._id,
      categoryName: category.name,
      department: deptId ? DEPT_CODE_MAP[d.deptCode as string] || undefined : undefined,
      tags: ['văn bản', 'trường đại học', d.status as string],
      content: `Nội dung chi tiết của văn bản "${d.title}". Đây là dữ liệu mẫu được sinh tự động.`,
      summary: `Tóm tắt nội dung văn bản "${d.title}"`,
      attachmentUrls: [],
    };
  }));
  logger.info(`✅ Seeded ${createdDocs.length} documents`);

  console.log('\n✅ DMS seed complete!');
  console.log(`   Document categories: ${createdCategories.length}`);
  console.log(`   Approval flows: ${createdFlows.length}`);
  console.log(`   Documents: ${createdDocs.length}`);
}

// Run directly when executed as script
const isMain = process.argv[1]?.endsWith('seedDms.ts') || process.argv[1]?.endsWith('seedDms.js');
if (isMain) {
  (async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/ums_db');
      await seedDms();
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      console.error('❌ seedDms failed:', e);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    }
  })();
}
