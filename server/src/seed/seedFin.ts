/**
 * Seed script — FIN (Tài chính & Kế toán) data
 * Run: npm run seed:fin
 *
 * Requires: seedSis() and seedHrm() already run.
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Tuition, Expenditure } from '../models/index.js';
import { Student } from '../models/index.js';
import { logger } from '../utils/logger.js';

config();

const TUITION_RECORDS: Array<Record<string, unknown>> = [];
const students = ['SV-2020-0001', 'SV-2020-0002', 'SV-2020-0003', 'SV-2020-0006', 'SV-2020-0007', 'SV-2021-0009', 'SV-2021-0010', 'SV-2021-0011', 'SV-2021-0012', 'SV-2021-0013', 'SV-2022-0016', 'SV-2022-0017', 'SV-2022-0018', 'SV-2022-0019', 'SV-2022-0020', 'SV-2023-0022', 'SV-2023-0023', 'SV-2023-0024', 'SV-2023-0025', 'SV-2024-0027'];
const STUDENT_NAMES: Record<string, string> = {
  'SV-2020-0001': 'Nguyễn Văn An', 'SV-2020-0002': 'Trần Thị Bình', 'SV-2020-0003': 'Lê Hoàng Cường',
  'SV-2020-0006': 'Đặng Thị Phương', 'SV-2020-0007': 'Hoàng Văn Em', 'SV-2021-0009': 'Vũ Văn Ích',
  'SV-2021-0010': 'Lý Thị Kim', 'SV-2021-0011': 'Trần Văn Lâm', 'SV-2021-0012': 'Nguyễn Thị Mai',
  'SV-2021-0013': 'Phan Văn Nam', 'SV-2022-0016': 'Trần Thị Quỳnh', 'SV-2022-0017': 'Lê Văn Rồi',
  'SV-2022-0018': 'Phạm Thị Sương', 'SV-2022-0019': 'Hoàng Văn Tùng', 'SV-2022-0020': 'Đặng Thị Uyên',
  'SV-2023-0022': 'Trần Thị Xuân', 'SV-2023-0023': 'Lê Hoàng Yến', 'SV-2023-0024': 'Phạm Văn Zũ',
  'SV-2023-0025': 'Hoàng Thị Ánh', 'SV-2024-0027': 'Nguyễn Thị Chi',
};

const STATUSES = ['paid', 'paid', 'paid', 'partial', 'unpaid', 'overdue'];
const METHODS = ['Chuyển khoản', 'Tiền mặt', 'Thẻ', 'VNPay'];
const YEARS = ['2023-2024', '2024-2025', '2025-2026'];
const SEMESTERS = ['1', '2'];

for (const studentId of students) {
  for (const year of YEARS.slice(0, 2)) {
    for (const semester of SEMESTERS) {
      if (year === '2025-2026' && semester === '2') continue;
      const baseAmount = 8500000 + Math.floor(Math.random() * 6000000);
      const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
      const paidAmount = status === 'paid' ? baseAmount : status === 'partial' ? Math.floor(baseAmount * 0.5) : 0;
      TUITION_RECORDS.push({
        studentId,
        studentName: STUDENT_NAMES[studentId],
        semester,
        academicYear: year,
        amount: baseAmount,
        paidAmount,
        status,
        paymentMethod: status === 'paid' || status === 'partial' ? METHODS[Math.floor(Math.random() * METHODS.length)] : undefined,
        paidAt: status === 'paid' ? new Date(`${year.split('-')[0]}-${parseInt(semester) * 4 < 10 ? '0' : ''}${parseInt(semester) * 4}-05`) : undefined,
        dueDate: new Date(`${year.split('-')[0]}-${String(parseInt(semester) * 4 - 1).padStart(2, '0')}-15`),
        note: '',
      });
    }
  }
}

const EXPENDITURES: Array<Record<string, unknown>> = [
  { name: 'Chi phí lương GV HK1 2025', category: 'personnel', amount: 850000000, department: 'P_TAICHINH', applicant: 'Đặng Văn Minh', status: 'approved', reason: 'Chi trả lương giảng viên học kỳ 1', requestDate: '2025-01-15', approveDate: '2025-01-20' },
  { name: 'Mua sắm thiết bị phòng thí nghiệm CNTT', category: 'equipment', amount: 320000000, department: 'KHOA_CNTT', applicant: 'Trần Hoàng Nam', status: 'completed', reason: 'Mua máy tính, máy chiếu, bộ kit IoT', requestDate: '2025-02-01', approveDate: '2025-02-10' },
  { name: 'Bảo trì Hạ tầng mạng', category: 'infrastructure', amount: 150000000, department: 'P_HCQT', applicant: 'Phạm Hoàng Phi', status: 'completed', reason: 'Bảo trì server, mạng LAN/WiFi', requestDate: '2025-03-01', approveDate: '2025-03-05' },
  { name: 'Tổ chức Hội thảo NCKH Quốc tế', category: 'research', amount: 280000000, department: 'VIEN_NCKH', applicant: 'Vũ Đình Hùng', status: 'completed', reason: 'Chi phí hội thảo, khách mời quốc tế', requestDate: '2025-04-01', approveDate: '2025-04-05' },
  { name: 'Chi phí đào tạo nâng cao CBGV', category: 'training', amount: 95000000, department: 'P_TOCHUC', applicant: 'Lý Thị Thu Trang', status: 'pending', reason: 'Gửi CBGV đi học chương trình Thạc sĩ', requestDate: '2025-05-01' },
  { name: 'Hỗ trợ sinh viên có hoàn cảnh khó khăn', category: 'student_support', amount: 45000000, department: 'P_CTSV', applicant: 'Nguyễn Thị Minh Thư', status: 'approved', reason: 'Chi trả học bổng khuyến khích học tập', requestDate: '2025-01-10', approveDate: '2025-01-15' },
  { name: 'Dịch vụ phần mềm Quản lý Đào tạo', category: 'administrative', amount: 180000000, department: 'P_DAOTAO', applicant: 'Hoàng Thị Lan', status: 'completed', reason: 'Bản quyền phần mềm năm 2025', requestDate: '2025-01-20', approveDate: '2025-01-25' },
  { name: 'Chi phí hoạt động Đảng - Đoàn', category: 'other', amount: 35000000, department: 'BAN_CTDLSV', applicant: 'Phạm Hoàng Phi', status: 'pending', reason: 'Tổ chức các hoạt động chính trị - xã hội', requestDate: '2025-05-10' },
  { name: 'Mua sách thư viện năm 2025', category: 'equipment', amount: 120000000, department: 'TT_THUDIEN', applicant: 'Nguyễn Thị Minh Thư', status: 'pending', reason: 'Bổ sung sách chuyên ngành, giáo trình mới', requestDate: '2025-05-15' },
  { name: 'Chi phí tổ chức Lễ tốt nghiệp 2025', category: 'student_support', amount: 200000000, department: 'P_DAOTAO', applicant: 'Hoàng Thị Lan', status: 'pending', reason: 'Chi phí tổ chức lễ tốt nghiệp đợt 1-2025', requestDate: '2025-06-01' },
];

export async function seedFin() {
  await Promise.all([Tuition.deleteMany({}), Expenditure.deleteMany({})]);
  logger.info('Cleared existing FIN data');

  const createdTuition = await Tuition.insertMany(TUITION_RECORDS);
  logger.info(`✅ Seeded ${createdTuition.length} tuition records`);

  const createdExpenditures = await Expenditure.insertMany(EXPENDITURES);
  logger.info(`✅ Seeded ${createdExpenditures.length} expenditures`);

  console.log('\n✅ FIN seed complete!');
  console.log(`   Tuition records: ${createdTuition.length}`);
  console.log(`   Expenditures: ${createdExpenditures.length}`);
}

// Run directly when executed as script
const isMain = process.argv[1]?.endsWith('seedFin.ts') || process.argv[1]?.endsWith('seedFin.js');
if (isMain) {
  (async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/ums_db');
      await seedFin();
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      console.error('❌ seedFin failed:', e);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    }
  })();
}
