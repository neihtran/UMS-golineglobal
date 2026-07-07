/**
 * Seed script — PORTAL (Cổng thông tin) data
 * Run: npm run seed:portal
 *
 * Requires: seedSis() and seedHrm() already run.
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Announcement, Notification } from '../models/index.js';
import { logger } from '../utils/logger.js';

config();

const ANNOUNCEMENTS: Array<Record<string, unknown>> = [
  { title: 'Thông báo tuyển sinh năm 2025', content: 'Trường Đại học XYZ thông báo tuyển sinh năm 2025 với 5 ngành đào tạo mới. Hạn đăng ký: 30/06/2025.', category: 'academic', status: 'published', author: 'Phòng Đào tạo', targetRoles: ['SINH_VIEN', 'GIAO_VIEN'] },
  { title: 'Hội thảo Khoa học Quốc tế 2025', content: 'Hội thảo quốc tế về "Chuyển đổi số trong Giáo dục Đại học" sẽ diễn ra từ 20-21/11/2025.', category: 'event', status: 'published', author: 'Viện NCKH', targetRoles: ['GIAO_VIEN', 'HIEU_TRUONG', 'PHO_HIEU_TRUONG'] },
  { title: 'Kết quả học tập HK1 2024-2025', content: 'Kết quả học tập học kỳ 1 năm học 2024-2025 đã được cập nhật. Sinh viên vui lòng kiểm tra trên hệ thống.', category: 'academic', status: 'published', author: 'Phòng Đào tạo', targetRoles: ['SINH_VIEN'] },
  { title: 'Lịch thi cuối kỳ HK2 2024-2025', content: 'Lịch thi cuối kỳ học kỳ 2 năm học 2024-2025 đã được công bố. Thời gian thi: 15/06/2025 - 30/06/2025.', category: 'academic', status: 'published', author: 'Phòng Khảo thí', targetRoles: ['SINH_VIEN', 'GIAO_VIEN'] },
  { title: 'Thông báo nghỉ lễ 30/4 - 1/5/2025', content: 'Trường thông báo lịch nghỉ lễ 30/4 và 1/5/2025. Các hoạt động học tập sẽ bù vào thứ Bảy tuần sau.', category: 'general', status: 'published', author: 'Phòng Hành chính', targetRoles: ['SINH_VIEN', 'GIAO_VIEN', 'NHAN_VIEN'] },
  { title: 'Hướng dẫn đăng ký học phần HK1 2025-2026', content: 'Sinh viên đăng ký học phần từ ngày 01/08 đến 15/08/2025 qua cổng thông tin.', category: 'academic', status: 'published', author: 'Phòng Đào tạo', targetRoles: ['SINH_VIEN'] },
  { title: 'Kết quả xét học bổng HK1 2024-2025', content: 'Danh sách sinh viên đạt học bổng khuyến khích học tập học kỳ 1 đã được công bố.', category: 'finance', status: 'published', author: 'Phòng CTSV', targetRoles: ['SINH_VIEN'] },
  { title: 'Thông báo tuyển dụng Giảng viên', content: 'Trường tuyển dụng 05 Giảng viên cơ hữu các ngành CNTT, Kinh tế, Luật. Hạn nộp hồ sơ: 30/06/2025.', category: 'hr', status: 'published', author: 'Phòng Tổ chức', targetRoles: [] },
  { title: 'Cảnh báo lừa đảo tuyển dụng', content: 'Cảnh báo các đối tượng giả mạo tuyển dụng của Trường ĐH XYZ. Sinh viên cần kiểm tra kỹ thông tin.', category: 'urgent', status: 'pinned', author: 'Phòng Hành chính', targetRoles: ['SINH_VIEN'] },
  { title: 'Bảo trì hệ thống Cổng thông tin', content: 'Hệ thống Cổng thông tin sẽ bảo trì từ 02:00-04:00 ngày 15/07/2025.', category: 'news', status: 'published', author: 'Phòng CNTT', targetRoles: ['SINH_VIEN', 'GIAO_VIEN', 'NHAN_VIEN'] },
];

const NOTIFICATIONS: Array<Record<string, unknown>> = [
  { recipientId: 'SV-2020-0001', recipientRole: 'SINH_VIEN', title: 'Kết quả thi giữa kỳ', message: 'Bạn đã đạt 85 điểm môn Cấu trúc Dữ liệu.', type: 'success', relatedModule: 'exam', actionUrl: '/exam/result/EX-CNTT-101-MID' },
  { recipientId: 'SV-2020-0001', recipientRole: 'SINH_VIEN', title: 'Nhắc nhở đăng ký học phần', message: 'Đăng ký học phần HK1 2025-2026 đang mở.', type: 'info', relatedModule: 'sis', actionUrl: '/sis/enrollment' },
  { recipientId: 'SV-2020-0002', recipientRole: 'SINH_VIEN', title: 'Học bổng đã được duyệt', message: 'Bạn đã đạt học bổng khuyến khích học tập HK1.', type: 'success', relatedModule: 'fin', actionUrl: '/fin/tuition' },
  { recipientId: 'SV-2020-0001', recipientRole: 'SINH_VIEN', title: 'Lịch thi cuối kỳ', message: 'Lịch thi cuối kỳ HK2 đã được công bố.', type: 'warning', relatedModule: 'exam' },
  { recipientId: 'VC-2020-008', recipientRole: 'GIAO_VIEN', title: 'Nhắc nhở nhập điểm', message: 'Vui lòng nhập điểm thi giữa kỳ trước ngày 25/04/2025.', type: 'warning', relatedModule: 'exam' },
  { recipientId: 'VC-2020-009', recipientRole: 'GIAO_VIEN', title: 'Báo cáo giảng dạy HK1', message: 'Báo cáo giảng dạy HK1 cần nộp trước ngày 30/04/2025.', type: 'info', relatedModule: 'lms' },
  { recipientId: 'SV-2022-0016', recipientRole: 'SINH_VIEN', title: 'Thông báo thực tập', message: 'Bạn đã đăng ký thực tập tại FPT Software.', type: 'info', relatedModule: 'sis' },
  { recipientId: 'SV-2021-0012', recipientRole: 'SINH_VIEN', title: 'Đăng ký môn học bổ sung', message: 'Thời hạn đăng ký môn học bổ sung: 10-15/07/2025.', type: 'info', relatedModule: 'sis' },
];

export async function seedPortal() {
  await Promise.all([Announcement.deleteMany({}), Notification.deleteMany({})]);
  logger.info('Cleared existing PORTAL data');

  const createdAnnouncements = await Announcement.insertMany(ANNOUNCEMENTS.map(a => ({
    ...a,
    tags: [a.category, 'trường đại học'],
    attachments: [],
    targetRoles: a.targetRoles as string[],
    publishAt: new Date(),
  })));
  logger.info(`✅ Seeded ${createdAnnouncements.length} announcements`);

  const createdNotifications = await Notification.insertMany(NOTIFICATIONS);
  logger.info(`✅ Seeded ${createdNotifications.length} notifications`);

  console.log('\n✅ PORTAL seed complete!');
  console.log(`   Announcements: ${createdAnnouncements.length}`);
  console.log(`   Notifications: ${createdNotifications.length}`);
}

// Run directly when executed as script
const isMain = process.argv[1]?.endsWith('seedPortal.ts') || process.argv[1]?.endsWith('seedPortal.js');
if (isMain) {
  (async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/ums_db');
      await seedPortal();
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      console.error('❌ seedPortal failed:', e);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    }
  })();
}
