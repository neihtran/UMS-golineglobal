/**
 * Seed script — BI (Phân tích Dữ liệu) data
 * Run: npm run seed:bi
 *
 * Requires: All module seeds already run.
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Report } from '../models/index.js';
import { logger } from '../utils/logger.js';

config();

const REPORTS: Array<Record<string, unknown>> = [
  { name: 'Báo cáo Tổng hợp Đăng ký Học tập HK1 2025', type: 'enrollment', module: 'sis', format: 'xlsx', isPublic: false, schedule: 'semester' },
  { name: 'Báo cáo Tổng số Viên chức theo Khoa', type: 'staff', module: 'hrm', format: 'pdf', isPublic: true, schedule: 'monthly' },
  { name: 'Báo cáo Thu chi Năm học 2024-2025', type: 'finance', module: 'fin', format: 'xlsx', isPublic: false, schedule: 'semester' },
  { name: 'Báo cáo Tốt nghiệp Đợt 1 - 2025', type: 'graduation', module: 'sis', format: 'pdf', isPublic: true, schedule: 'semester' },
  { name: 'Báo cáo Hoạt động NCKH Năm 2024', type: 'research', module: 'rit', format: 'pdf', isPublic: true, schedule: 'monthly' },
  { name: 'Báo cáo Mượn trả Sách Tháng 05/2025', type: 'library', module: 'lib', format: 'csv', isPublic: false, schedule: 'monthly' },
  { name: 'Báo cáo Tình hình Phòng KTX Tháng 06/2025', type: 'custom', module: 'ktx', format: 'xlsx', isPublic: false, schedule: 'monthly' },
  { name: 'Báo cáo Kết quả Thi cuối kỳ HK2 2025', type: 'custom', module: 'exam', format: 'pdf', isPublic: false, schedule: 'semester' },
  { name: 'Báo cáo Minh chứng Kiểm định AUN-QA', type: 'custom', module: 'qa', format: 'pdf', isPublic: true, schedule: 'monthly' },
  { name: 'Báo cáo Đánh giá Năng lực Số CBGV 2025', type: 'custom', module: 'dce', format: 'xlsx', isPublic: false, schedule: 'monthly' },
];

export async function seedBi() {
  await Report.deleteMany({});
  logger.info('Cleared existing BI data');

  const createdReports = await Report.insertMany(REPORTS.map(r => ({
    ...r,
    params: {},
    description: `Báo cáo: ${r.name}`,
    generatedAt: r.schedule === 'on_demand' ? undefined : new Date(),
  })));
  logger.info(`✅ Seeded ${createdReports.length} reports`);

  console.log('\n✅ BI seed complete!');
  console.log(`   Reports: ${createdReports.length}`);
}

// Run directly when executed as script
const isMain = process.argv[1]?.endsWith('seedBi.ts') || process.argv[1]?.endsWith('seedBi.js');
if (isMain) {
  (async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/ums_db');
      await seedBi();
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      console.error('❌ seedBi failed:', e);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    }
  })();
}
