/**
 * Seed script — QA (Kiểm định Chất lượng) data
 * Run: npm run seed:qa
 *
 * Requires: seedHrm() already run.
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Evidence, Assessment } from '../models/index.js';
import { logger } from '../utils/logger.js';

config();

const STANDARDS = [
  { code: 'AUN_1', name: 'Tiêu chí 1: Tầm nhìn - Sứ mệnh - Mục tiêu', description: 'Đánh giá tầm nhìn, sứ mệnh và mục tiêu của tổ chức' },
  { code: 'AUN_2', name: 'Tiêu chí 2: Quản trị Hệ thống', description: 'Công tác quản trị, lãnh đạo, tổ chức' },
  { code: 'AUN_3', name: 'Tiêu chí 3: Học tập & Giảng dạy', description: 'Chương trình đào tạo, phương pháp giảng dạy, đánh giá' },
  { code: 'AUN_4', name: 'Tiêu chí 4: Hỗ trợ Học tập', description: 'Thư viện, CNTT, cơ sở vật chất' },
  { code: 'AUN_5', name: 'Tiêu chí 5: Nghiên cứu & Dịch vụ Cộng đồng', description: 'NCKH, hợp tác, dịch vụ cộng đồng' },
  { code: 'AUN_6', name: 'Tiêu chí 6: Hỗ trợ Giảng viên', description: 'Tuyển chọn, phát triển, đánh giá GV' },
  { code: 'AUN_7', name: 'Tiêu chí 7: Tài chính & Hạ tầng', description: 'Quản lý tài chính, cơ sở vật chất' },
  { code: 'AUN_8', name: 'Tiêu chí 8: Đánh giá & Cải tiến liên tục', description: 'QA, đánh giá nội bộ, cải tiến' },
];

const EVIDENCES: Array<Record<string, unknown>> = [
  { title: 'Quy chế Đào tạo ĐH 2024', standardCode: 'AUN_3', criteria: ['3.1', '3.2'], status: 'approved', submittedBy: 'P_DAOTAO', reviewedBy: 'P_KHTH', submitDate: '2025-01-15', reviewDate: '2025-02-01' },
  { title: 'Kết quả khảo sát Sinh viên HK1 2024-2025', standardCode: 'AUN_3', criteria: ['3.4'], status: 'approved', submittedBy: 'P_KHTH', reviewedBy: 'P_KHTH', submitDate: '2025-01-20', reviewDate: '2025-02-10' },
  { title: 'Hợp đồng lao động GV cơ hữu', standardCode: 'AUN_6', criteria: ['6.1', '6.2'], status: 'submitted', submittedBy: 'P_TOCHUC', reviewedBy: '', submitDate: '2025-04-01' },
  { title: 'Báo cáo tự đánh giá 2024', standardCode: 'AUN_1', criteria: ['1.1', '1.2', '1.3'], status: 'reviewing', submittedBy: 'P_KHTH', reviewedBy: 'HIEU_TRUONG', submitDate: '2025-03-01' },
  { title: 'Thống kê cơ sở vật chất 2024', standardCode: 'AUN_4', criteria: ['4.1', '4.2'], status: 'approved', submittedBy: 'P_HCQT', reviewedBy: 'P_KHTH', submitDate: '2025-02-15', reviewDate: '2025-03-01' },
  { title: 'Kết quả nghiên cứu khoa học 2024', standardCode: 'AUN_5', criteria: ['5.1', '5.2'], status: 'draft', submittedBy: 'VIEN_NCKH', reviewedBy: '', submitDate: '2025-05-01' },
  { title: 'Báo cáo tài chính năm 2024', standardCode: 'AUN_7', criteria: ['7.1'], status: 'approved', submittedBy: 'P_TAICHINH', reviewedBy: 'P_KHTH', submitDate: '2025-01-10', reviewDate: '2025-01-30' },
  { title: 'Kết quả kiểm định AUN-QA 2023', standardCode: 'AUN_8', criteria: ['8.1', '8.2'], status: 'archived', submittedBy: 'P_KHTH', reviewedBy: 'P_KHTH', submitDate: '2024-01-01', reviewDate: '2024-02-01' },
  { title: 'Chương trình đào tạo CNTT', standardCode: 'AUN_3', criteria: ['3.1'], status: 'approved', submittedBy: 'KHOA_CNTT', reviewedBy: 'P_DAOTAO', submitDate: '2025-02-01', reviewDate: '2025-02-20' },
  { title: 'Danh mục sách thư viện 2024', standardCode: 'AUN_4', criteria: ['4.3'], status: 'submitted', submittedBy: 'TT_THUDIEN', reviewedBy: 'P_KHTH', submitDate: '2025-05-10' },
  { title: 'Kế hoạch phát triển Đội ngũ GV 2025', standardCode: 'AUN_6', criteria: ['6.3', '6.4'], status: 'rejected', submittedBy: 'P_TOCHUC', reviewedBy: 'P_KHTH', submitDate: '2025-03-10', reviewDate: '2025-03-25' },
  { title: 'Báo cáo khảo sát Cơ sở Vật chất', standardCode: 'AUN_7', criteria: ['7.2'], status: 'reviewing', submittedBy: 'P_HCQT', reviewedBy: 'P_KHTH', submitDate: '2025-04-15' },
];

const ASSESSMENTS: Array<Record<string, unknown>> = [
  { title: 'Tự đánh giá AUN-QA 2025', type: 'self_assessment', standardCode: 'AUN_1', targetDepartment: '', assessors: ['P_KHTH', 'HIEU_TRUONG'], startDate: '2025-03-01', endDate: '2025-06-30', status: 'active', criteria: [{ code: '1.1', description: 'Tầm nhìn - Sứ mệnh', weight: 15 }, { code: '1.2', description: 'Mục tiêu chiến lược', weight: 15 }, { code: '1.3', description: 'Kế hoạch thực thi', weight: 10 }] },
  { title: 'Đánh giá nội bộ Quy trình Đào tạo', type: 'internal', standardCode: 'AUN_3', targetDepartment: 'KHOA_CNTT', assessors: ['P_KHTH', 'P_DAOTAO'], startDate: '2025-04-01', endDate: '2025-05-31', status: 'active', criteria: [{ code: '3.1', description: 'Chương trình đào tạo', weight: 25 }, { code: '3.2', description: 'Phương pháp giảng dạy', weight: 25 }] },
  { title: 'Đánh giá Khoa CNTT theo AUN-QA', type: 'external', standardCode: 'AUN_3', targetDepartment: 'KHOA_CNTT', assessors: ['P_KHTH'], startDate: '2025-09-01', endDate: '2025-12-31', status: 'planning', criteria: [{ code: '3.1', description: 'Chương trình đào tạo', weight: 20 }, { code: '3.4', description: 'Đánh giá đầu ra', weight: 30 }] },
  { title: 'Đánh giá hệ thống Quản trị', type: 'internal', standardCode: 'AUN_2', targetDepartment: '', assessors: ['P_TOCHUC'], startDate: '2025-05-01', endDate: '2025-07-31', status: 'planning', criteria: [{ code: '2.1', description: 'Lãnh đạo & Quản trị', weight: 30 }, { code: '2.2', description: 'Hệ thống thông tin', weight: 20 }] },
];

export async function seedQa() {
  await Promise.all([Evidence.deleteMany({}), Assessment.deleteMany({})]);
  logger.info('Cleared existing QA data');

  const createdEvidences = await Evidence.insertMany(EVIDENCES.map(e => ({
    ...e,
    documentUrls: ['https://example.com/docs/' + (e.title as string).toLowerCase().replace(/[^a-z0-9]/g, '-') + '.pdf'],
    criteria: e.criteria as string[],
    submittedAt: e.submitDate ? new Date(e.submitDate as string) : undefined,
    reviewedAt: e.reviewDate ? new Date(e.reviewDate as string) : undefined,
    reviewComment: e.status === 'rejected' ? 'Chưa đầy đủ minh chứng theo yêu cầu' : e.status === 'approved' ? 'Đạt yêu cầu' : undefined,
  })));
  logger.info(`✅ Seeded ${createdEvidences.length} evidences`);

  const createdAssessments = await Assessment.insertMany(ASSESSMENTS);
  logger.info(`✅ Seeded ${createdAssessments.length} assessments`);

  console.log('\n✅ QA seed complete!');
  console.log(`   Evidences: ${createdEvidences.length}`);
  console.log(`   Assessments: ${createdAssessments.length}`);
}

// Run directly when executed as script
const isMain = process.argv[1]?.endsWith('seedQa.ts') || process.argv[1]?.endsWith('seedQa.js');
if (isMain) {
  (async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/ums_db');
      await seedQa();
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      console.error('❌ seedQa failed:', e);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    }
  })();
}
