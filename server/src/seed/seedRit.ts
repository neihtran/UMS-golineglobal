/**
 * Seed script — RIT (NCKH & HTQT) data
 * Run: npm run seed:rit
 *
 * Requires: seedHrm() already run.
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { ResearchProject } from '../models/index.js';
import { VienChuc } from '../models/index.js';
import { logger } from '../utils/logger.js';

config();

const PROJECTS: Array<Record<string, unknown>> = [
  { code: 'NCKH-2024-001', name: 'Ứng dụng AI trong Dự báo Kết quả Học tập', type: 'research', status: 'active', principal: 'VC-2020-008', members: ['VC-2020-008', 'VC-2025-013'], department: 'KHOA_CNTT', funding: 300000000, fundingUnit: 'Nafosted', startDate: '2024-01-01', endDate: '2025-12-31' },
  { code: 'NCKH-2024-002', name: 'Nghiên cứu Blockchain trong Quản lý Văn bằng', type: 'research', status: 'active', principal: 'VC-2020-008', members: ['VC-2020-008'], department: 'KHOA_CNTT', funding: 150000000, fundingUnit: 'Trường', startDate: '2024-06-01', endDate: '2026-05-31' },
  { code: 'NCKH-2024-003', name: 'Phát triển Hệ thống Tư vấn Tuyển sinh AI', type: 'application', status: 'active', principal: 'VC-2022-018', members: ['VC-2022-018', 'VC-2022-018'], department: 'P_DAOTAO', funding: 200000000, fundingUnit: 'Bộ GD&ĐT', startDate: '2024-09-01', endDate: '2025-12-31' },
  { code: 'QT-2024-001', name: 'Hợp tác với Đại học Seoul', type: 'international', status: 'active', principal: 'VC-2015-003', members: ['VC-2015-003', 'VC-2012-002'], department: 'P_QHMT', funding: 500000000, fundingUnit: 'Bộ GD&ĐT', startDate: '2024-01-01', endDate: '2028-12-31' },
  { code: 'NCKH-2023-004', name: 'Xây dựng Mô hình dự báo Biến đổi Khí hậu', type: 'research', status: 'completed', principal: 'VC-2022-012', members: ['VC-2022-012'], department: 'KHOA_KHXD', funding: 250000000, fundingUnit: 'Nafosted', startDate: '2023-01-01', endDate: '2024-12-31', result: 'Công bố 02 bài SCI, 01 bằng sáng chế' },
  { code: 'UT-2024-001', name: 'Chuyển giao Công nghệ IoT nông nghiệp', type: 'tech_transfer', status: 'active', principal: 'VC-2025-014', members: ['VC-2025-014'], department: 'KHOA_DIENTU', funding: 180000000, fundingUnit: 'Doanh nghiệp', startDate: '2024-07-01', endDate: '2025-12-31' },
  { code: 'NCKH-2025-001', name: 'Đánh giá Hiệu quả Đào tạo Theo thông lệ Quốc tế', type: 'research', status: 'planning', principal: 'VC-2012-002', members: ['VC-2012-002', 'VC-2022-018'], department: 'P_KHTH', funding: 120000000, fundingUnit: 'Trường', startDate: '2025-09-01', endDate: '2027-08-31' },
  { code: 'QT-2025-001', name: 'Hợp tác Erasmus+ với ĐH Wrocław', type: 'international', status: 'planning', principal: 'VC-2012-002', members: ['VC-2012-002'], department: 'P_QHMT', funding: 800000000, fundingUnit: 'EU', startDate: '2025-10-01', endDate: '2029-09-30' },
  { code: 'NCKH-2025-002', name: 'Nghiên cứu Công nghệ Carbon Capture', type: 'research', status: 'planning', principal: 'VC-2025-014', members: ['VC-2025-014', 'VC-2025-014'], department: 'KHOA_MOITRUONG', funding: 400000000, fundingUnit: 'Nafosted', startDate: '2026-01-01', endDate: '2028-12-31' },
];

export async function seedRit() {
  await ResearchProject.deleteMany({});
  logger.info('Cleared existing RIT data');

  const vcList = await VienChuc.find({}).limit(5);
  const vcIds = vcList.map(v => v._id.toString());

  const createdProjects = await ResearchProject.insertMany(PROJECTS.map((p, i) => ({
    ...p,
    principalName: p.principal ? vcList.find(v => v.code === p.principal)?.name : undefined,
    members: (p.members as string[]).map((m: string) => vcIds[Math.floor(Math.random() * vcIds.length)]),
    publications: p.status === 'completed' ? [
      { title: 'Bài báo: Kết quả nghiên cứu ' + p.name, journal: 'Tạp chí Khoa học XYZ', year: 2025 },
    ] : [],
    description: `Đề tài: ${p.name}. Đơn vị chủ trì: ${p.department}`,
  })));
  logger.info(`✅ Seeded ${createdProjects.length} research projects`);

  console.log('\n✅ RIT seed complete!');
  console.log(`   Research projects: ${createdProjects.length}`);
}

// Run directly when executed as script
const isMain = process.argv[1]?.endsWith('seedRit.ts') || process.argv[1]?.endsWith('seedRit.js');
if (isMain) {
  (async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/ums_db');
      await seedRit();
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      console.error('❌ seedRit failed:', e);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    }
  })();
}
