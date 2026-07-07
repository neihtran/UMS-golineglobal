/**
 * Seed script — OCR (Số hóa Tài liệu) data
 * Run: npm run seed:ocr
 *
 * Requires: seedDms() already run (for documentId references).
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Document, OCRJob } from '../models/index.js';
import { logger } from '../utils/logger.js';

config();

const OCR_JOBS: Array<Record<string, unknown>> = [
  { source: 'upload', fileName: 'quyet-dinh-2025-001.pdf', language: 'vie', outputFormat: 'txt', category: 'Công văn', status: 'completed', resultText: 'QUYẾT ĐỊNH\nV/v: Ban hành Quy chế đào tạo mới\nĐiều 1. Ban hành kèm theo Quyết định này Quy chế đào tạo đại học...\nĐiều 2. Quyết định này có hiệu lực kể từ ngày ký.', confidence: 98, processingTimeMs: 3200 },
  { source: 'scan', fileName: 'bao-cao-thang-01-2025.jpg', language: 'vie', outputFormat: 'pdf', category: 'Báo cáo', status: 'completed', resultText: 'BÁO CÁO THÁNG 01/2025\n- Tổng số văn bản: 45\n- Văn bản mới: 12\n- Văn bản phê duyệt: 8\n- Văn bản từ chối: 2\n- Tỷ lệ phê duyệt: 80%', confidence: 94, processingTimeMs: 5100 },
  { source: 'upload', fileName: 'hop-dong-thue-phong-hop.docx', language: 'vie', outputFormat: 'docx', category: 'Hợp đồng', status: 'completed', resultText: 'HỢP ĐỒNG THUÊ PHÒNG HỌP\nBên cho thuê: Trường Đại học XYZ\nBên thuê: Công ty ABC\nThời hạn: 12 tháng\nGiá thuê: 15,000,000đ/tháng', confidence: 97, processingTimeMs: 2800 },
  { source: 'scan', fileName: 'bien-ban-hop-dh-khoa.pdf', language: 'vie', outputFormat: 'txt', category: 'Biên bản', status: 'completed', resultText: 'BIÊN BẢN HỌP HỘI ĐỒNG KHOA\nNgày: 15/01/2025\nChủ tọa: PGS.TS. Hoàng Minh Tuấn\nNội dung: Đánh giá kết quả học tập HK1 2024-2025\nThống nhất: Tăng cường giảng dạy thực hành', confidence: 91, processingTimeMs: 4500 },
  { source: 'url', fileName: 'thong-bao-tuyen-sinh-2025.png', language: 'vie', outputFormat: 'json', category: 'Thông báo', status: 'completed', resultText: 'THÔNG BÁO TUYỂN SINH 2025\n- Đối tượng: Thí sinh tốt nghiệp THPT\n- Ngành xét tuyển: CNTT, Kinh tế, Luật, NN\n- Hạn nộp: 30/06/2025\n- Liên hệ: 028.1234.5678', confidence: 95, processingTimeMs: 1800 },
  { source: 'upload', fileName: 'quy-che-dao-tao-2024.pdf', language: 'vie', outputFormat: 'txt', category: 'Quy chế', status: 'processing', confidence: undefined, processingTimeMs: undefined },
  { source: 'scan', fileName: 'ke-hoach-nam-hoc-2025.jpg', language: 'vie', outputFormat: 'pdf', category: 'Kế hoạch', status: 'queued', confidence: undefined, processingTimeMs: undefined },
  { source: 'upload', fileName: 'ke-toan-quyet-toan-2024.pdf', language: 'vie', outputFormat: 'json', category: 'Báo cáo', status: 'failed', errorMessage: 'Lỗi đọc font chữ scan: không nhận diện được số liệu bảng', processingTimeMs: 1200 },
  { source: 'scan', fileName: 'ban-giam-hieu-quyet-dinh.jpg', language: 'vie', outputFormat: 'txt', category: 'Công văn', status: 'completed', resultText: 'QUYẾT ĐỊNH\nV/v: Điều chỉnh lịch khai giảng\nHội đồng trường thống nhất điều chỉnh lịch khai giảng năm học 2025-2026...', confidence: 93, processingTimeMs: 3800 },
  { source: 'upload', fileName: 'hop-dong-thinh-giang.docx', language: 'vie', outputFormat: 'docx', category: 'Hợp đồng', status: 'cancelled', errorMessage: 'Người dùng hủy quá trình xử lý', processingTimeMs: 500 },
];

export async function seedOcr() {
  await OCRJob.deleteMany({});
  logger.info('Cleared existing OCR jobs');

  const documents = await Document.find({}).limit(20);
  const docIds = documents.map(d => d._id);

  const createdJobs = await OCRJob.insertMany(OCR_JOBS.map((job, i) => ({
    ...job,
    documentId: i < 5 ? docIds[i] : undefined,
    tags: [job.category as string, 'OCR', 'số hóa'],
  })));
  logger.info(`✅ Seeded ${createdJobs.length} OCR jobs`);

  console.log('\n✅ OCR seed complete!');
  console.log(`   OCR jobs: ${createdJobs.length}`);
}

// Run directly when executed as script
const isMain = process.argv[1]?.endsWith('seedOcr.ts') || process.argv[1]?.endsWith('seedOcr.js');
if (isMain) {
  (async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/ums_db');
      await seedOcr();
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      console.error('❌ seedOcr failed:', e);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    }
  })();
}
