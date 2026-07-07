/**
 * Seed script — DCE (Năng lực Số) data
 * Run: npm run seed:dce
 *
 * Requires: seedHrm() already run.
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Competency, CompetencyAssessment } from '../models/index.js';
import { VienChuc } from '../models/index.js';
import { logger } from '../utils/logger.js';

config();

const COMPETENCIES: Array<Record<string, unknown>> = [
  { name: 'Sử dụng công cụ số cơ bản', category: 'digital_competence', description: 'Khả năng sử dụng máy tính, phần mềm văn phòng, internet cơ bản', indicators: ['Sử dụng máy tính', 'Soạn thảo văn bản', 'Tra cứu thông tin online'] },
  { name: 'Phát triển phần mềm', category: 'digital_competence', description: 'Khả năng lập trình, phát triển ứng dụng', indicators: ['Ngôn ngữ lập trình', 'Công cụ phát triển', 'Testing'] },
  { name: 'Quản trị dữ liệu', category: 'digital_competence', description: 'Khả năng phân tích và quản lý dữ liệu', indicators: ['Cơ sở dữ liệu', 'Phân tích dữ liệu', 'Trực quan hóa'] },
  { name: 'Thiết kế bài giảng điện tử', category: 'teaching_competence', description: 'Khả năng thiết kế và phát triển tài liệu giảng dạy số', indicators: ['Thiết kế slide', 'Video bài giảng', 'Bài tập online'] },
  { name: 'Dạy học trực tuyến', category: 'teaching_competence', description: 'Khả năng tổ chức và dạy học qua nền tảng số', indicators: ['Zoom/Teams', 'LMS', 'Tương tác online'] },
  { name: 'Nghiên cứu khoa học', category: 'research_competence', description: 'Khả năng thực hiện nghiên cứu khoa học', indicators: ['Viết bài báo', 'Nộp đề tài', 'Báo cáo'] },
  { name: 'Xuất bản học thuật', category: 'research_competence', description: 'Khả năng xuất bản bài báo khoa học', indicators: ['Journal quốc tế', 'Hội nghị', 'Sách chuyên khảo'] },
  { name: 'Lãnh đạo & Quản lý', category: 'leadership_competence', description: 'Khả năng lãnh đạo và quản lý nhóm', indicators: ['Quản lý dự án', 'Phát triển đội ngũ', 'Ra quyết định'] },
];

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  A1: 'Người mới bắt đầu - Cần hướng dẫn chi tiết',
  A2: 'Có thể thực hiện với sự hỗ trợ',
  B1: 'Thực hiện độc lập trong tình huống quen thuộc',
  B2: 'Thực hiện độc lập và giải quyết vấn đề',
  C1: 'Hướng dẫn người khác',
  C2: 'Chuyên gia, đổi mới',
};

export async function seedDce() {
  await Promise.all([Competency.deleteMany({}), CompetencyAssessment.deleteMany({})]);
  logger.info('Cleared existing DCE data');

  const createdCompetencies = await Competency.insertMany(COMPETENCIES.map(c => ({
    ...c,
    levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => ({ level, description: LEVEL_DESCRIPTIONS[level] })),
  })));
  logger.info(`✅ Seeded ${createdCompetencies.length} competencies`);

  const vcList = await VienChuc.find({}).limit(20);
  const assessments: Array<Record<string, unknown>> = [];
  for (const vc of vcList) {
    const numAssessments = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numAssessments; i++) {
      const comp = createdCompetencies[Math.floor(Math.random() * createdCompetencies.length)];
      const levels: string[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const selfLevel = levels[1 + Math.floor(Math.random() * 4)];
      const assessedLevel = levels[Math.floor(Math.random() * 6)];
      assessments.push({
        personId: vc._id.toString(),
        personName: vc.name,
        competencyId: comp._id,
        assessor: 'P_TOCHUC',
        selfLevel,
        assessedLevel,
        score: 4 + Math.floor(Math.random() * 6),
        comment: assessedLevel === selfLevel ? 'Đúng với đánh giá bản thân' : 'Cần cải thiện thêm',
        evidenceUrls: [],
        assessedAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 86400000),
      });
    }
  }

  const createdAssessments = await CompetencyAssessment.insertMany(assessments.slice(0, 50));
  logger.info(`✅ Seeded ${createdAssessments.length} competency assessments`);

  console.log('\n✅ DCE seed complete!');
  console.log(`   Competencies: ${createdCompetencies.length}`);
  console.log(`   Competency assessments: ${createdAssessments.length}`);
}

// Run directly when executed as script
const isMain = process.argv[1]?.endsWith('seedDce.ts') || process.argv[1]?.endsWith('seedDce.js');
if (isMain) {
  (async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/ums_db');
      await seedDce();
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      console.error('❌ seedDce failed:', e);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    }
  })();
}
