/**
 * Seed script — PMS (Công tác Đảng) data
 * Run: npm run seed:pms
 *
 * Requires: seedHrm() already run (for vienChuc references).
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { PartyMember, PartyActivity } from '../models/index.js';
import { logger } from '../utils/logger.js';

config();

const PARTY_MEMBERS: Array<Record<string, unknown>> = [
  { vienChucId: 'VC-2015-003', name: 'PGS.TS. Hoàng Minh Tuấn', gender: 'Nam', joinPartyDate: '2005-06-15', becomeFullMemberDate: '2008-06-15', status: 'active', partyPosition: 'Bí thư Chi bộ', department: 'KHOA_CNTT', cell: 'Chi bộ CNTT' },
  { vienChucId: 'VC-2016-004', name: 'TS. Lê Thị Thu Hà', gender: 'Nữ', joinPartyDate: '2008-07-01', becomeFullMemberDate: '2011-07-01', status: 'active', partyPosition: 'Phó Bí thư Chi bộ', department: 'KHOA_KINHTE', cell: 'Chi bộ KT' },
  { vienChucId: 'VC-2020-008', name: 'ThS. Nguyễn Hoàng Long', gender: 'Nam', joinPartyDate: '2015-01-10', becomeFullMemberDate: '2018-01-10', status: 'active', partyPosition: 'Đảng viên', department: 'KHOA_CNTT', cell: 'Chi bộ CNTT' },
  { vienChucId: 'VC-2018-006', name: 'ThS. Trần Hoàng Nam', gender: 'Nam', joinPartyDate: '2012-03-05', becomeFullMemberDate: '2015-03-05', status: 'active', partyPosition: 'Đảng viên', department: 'KHOA_CNTT', cell: 'Chi bộ CNTT' },
  { vienChucId: 'VC-2020-009', name: 'ThS. Trần Thị Mai Lan', gender: 'Nữ', joinPartyDate: '2018-09-20', becomeFullMemberDate: '2021-09-20', status: 'active', partyPosition: 'Đảng viên', department: 'KHOA_KINHTE', cell: 'Chi bộ KT' },
  { vienChucId: 'VC-2019-015', name: 'CN. Nguyễn Thị Thu Hằng', gender: 'Nữ', joinPartyDate: '2020-12-01', becomeFullMemberDate: '2024-12-01', status: 'probation', partyPosition: 'Đảng viên dự bị', department: 'P_TOCHUC', cell: 'Chi bộ HC' },
  { vienChucId: 'VC-2012-002', name: 'PGS.TS. Nguyễn Thị Lan Hương', gender: 'Nữ', joinPartyDate: '2003-04-15', becomeFullMemberDate: '2006-04-15', status: 'active', partyPosition: 'Ủy viên Ban chấp hành', department: 'BAN_CTDLSV', cell: 'Chi bộ Lãnh đạo' },
  { vienChucId: 'VC-2017-005', name: 'TS. Phạm Văn Bình', gender: 'Nam', joinPartyDate: '2010-11-08', becomeFullMemberDate: '2013-11-08', status: 'active', partyPosition: 'Bí thư Chi bộ', department: 'KHOA_LUAT', cell: 'Chi bộ Luật' },
  { vienChucId: 'VC-2022-012', name: 'PGS.TS. Vũ Đình Hùng', gender: 'Nam', joinPartyDate: '1995-03-12', becomeFullMemberDate: '1998-03-12', status: 'active', partyPosition: 'Đảng viên', department: 'KHOA_KHXD', cell: 'Chi bộ KHXD' },
  { vienChucId: 'VC-2021-011', name: 'ThS. Phạm Thị Hương Giang', gender: 'Nữ', joinPartyDate: '2019-06-30', becomeFullMemberDate: '2022-06-30', status: 'active', partyPosition: 'Đảng viên', department: 'KHOA_NN', cell: 'Chi bộ NN' },
  { vienChucId: 'VC-2021-010', name: 'ThS. Lê Văn Minh', gender: 'Nam', joinPartyDate: '2020-07-15', becomeFullMemberDate: null, status: 'probation', partyPosition: 'Đảng viên dự bị', department: 'KHOA_LUAT', cell: 'Chi bộ Luật' },
  { vienChucId: 'VC-2022-018', name: 'ThS. Lý Thị Thu Trang', gender: 'Nữ', joinPartyDate: '2021-03-20', becomeFullMemberDate: '2024-03-20', status: 'active', partyPosition: 'Đảng viên', department: 'P_KHTH', cell: 'Chi bộ HC' },
  { vienChucId: 'VC-2017-005', name: 'TS. Phạm Văn Bình', gender: 'Nam', joinPartyDate: '2010-11-08', becomeFullMemberDate: '2013-11-08', status: 'retired', partyPosition: 'Đảng viên', department: 'KHOA_LUAT', cell: 'Chi bộ Luật' },
];

const ACTIVITIES: Array<Record<string, unknown>> = [
  { name: 'Học tập Chuyên đề 5 năm 2025', type: 'study', description: 'Học tập, quán triệt Nghị quyết Đại hội Đảng lần thứ XIV', organizer: 'Chi ủy Chi bộ CNTT', startDate: '2025-01-15', endDate: '2025-01-30', location: 'Phòng họp A', status: 'completed', participants: ['VC-2020-008', 'VC-2018-006', 'VC-2022-018'] },
  { name: 'Họp Chi bộ định kỳ T02/2025', type: 'meeting', description: 'Họp chi bộ đánh giá công tác tháng 1', organizer: 'Bí thư Chi bộ CNTT', startDate: '2025-02-05', endDate: '2025-02-05', location: 'Phòng họp A', status: 'completed', participants: ['VC-2020-008', 'VC-2018-006'] },
  { name: 'Chiến dịch tình nguyện hè 2025', type: 'campaign', description: 'Tổ chức chiến dịch tình nguyện hè tại xã vùng sâu', organizer: 'Ban CTĐT-SV', startDate: '2025-07-01', endDate: '2025-07-15', location: 'Xã ABC, Huyện XYZ', status: 'planned', participants: ['VC-2020-008', 'VC-2020-009', 'VC-2022-018'] },
  { name: 'Ủng hộ đồng bào miền Bắc', type: 'donation', description: 'Ủng hộ nhân dân miền Bắc bị thiên tai', organizer: 'Ban CTĐT-SV', startDate: '2024-09-15', endDate: '2024-10-01', location: 'Trường ĐH XYZ', status: 'completed', participants: ['VC-2019-015', 'VC-2020-009', 'VC-2022-018', 'VC-2012-002'] },
  { name: 'Lễ kỷ niệm 95 năm Ngày thành lập Đảng', type: 'ceremony', description: 'Tổ chức Lễ kỷ niệm và trao Huy hiệu Đảng', organizer: 'Đảng ủy Trường', startDate: '2026-02-03', endDate: '2026-02-03', location: 'Hội trường A', status: 'planned', participants: ['VC-2015-003', 'VC-2012-002', 'VC-2015-003', 'VC-2022-012'] },
  { name: 'Học tập Chuyên đề QP&AN 2024', type: 'study', description: 'Học tập chuyên đề quốc phòng toàn dân', organizer: 'Chi ủy Chi bộ CNTT', startDate: '2024-08-01', endDate: '2024-08-15', location: 'Phòng học B201', status: 'completed', participants: ['VC-2020-008', 'VC-2025-013'] },
  { name: 'Họp Chi bộ tháng 03/2025', type: 'meeting', description: 'Họp chi bộ đánh giá công tác tháng 2, triển khai tháng 3', organizer: 'Bí thư Chi bộ CNTT', startDate: '2025-03-10', endDate: '2025-03-10', location: 'Phòng họp A', status: 'completed', participants: ['VC-2020-008', 'VC-2018-006', 'VC-2025-013'] },
  { name: 'Ngày toàn dân hiến máu', type: 'campaign', description: 'Vận động Đảng viên, sinh viên tham gia hiến máu', organizer: 'Ban CTĐT-SV', startDate: '2025-04-15', endDate: '2025-04-15', location: 'Hội trường C', status: 'ongoing', participants: ['VC-2020-009', 'VC-2021-010', 'VC-2019-015'] },
  { name: 'Họp giao ban Đảng ủy Tháng 04/2025', type: 'meeting', description: 'Giao ban công tác đảng các chi bộ', organizer: 'Đảng ủy Trường', startDate: '2025-04-05', endDate: '2025-04-05', location: 'Phòng họp Lãnh đạo', status: 'ongoing', participants: ['VC-2015-003', 'VC-2012-002', 'VC-2016-004', 'VC-2017-005'] },
  { name: 'Học tập Nghị quyết Trung ương 8', type: 'study', description: 'Học tập Nghị quyết Hội nghị TW 8 khóa XIII', organizer: 'Đảng ủy Trường', startDate: '2025-05-01', endDate: '2025-05-15', location: 'Hội trường A', status: 'planned', participants: ['VC-2020-008', 'VC-2018-006', 'VC-2017-005', 'VC-2022-012'] },
];

export async function seedPms() {
  await Promise.all([PartyMember.deleteMany({}), PartyActivity.deleteMany({})]);
  logger.info('Cleared existing PMS data');

  const createdMembers = await PartyMember.insertMany(PARTY_MEMBERS.map(m => ({
    ...m,
    joinPartyDate: m.joinPartyDate ? new Date(m.joinPartyDate as string) : undefined,
    becomeFullMemberDate: m.becomeFullMemberDate ? new Date(m.becomeFullMemberDate as string) : undefined,
  })));
  logger.info(`✅ Seeded ${createdMembers.length} party members`);

  const createdActivities = await PartyActivity.insertMany(ACTIVITIES.map(a => ({
    ...a,
    startDate: new Date(a.startDate as string),
    endDate: new Date(a.endDate as string),
    participants: a.participants as string[],
    result: a.status === 'completed' ? 'Hoàn thành tốt đẹp' : '',
  })));
  logger.info(`✅ Seeded ${createdActivities.length} party activities`);

  console.log('\n✅ PMS seed complete!');
  console.log(`   Party members: ${createdMembers.length}`);
  console.log(`   Party activities: ${createdActivities.length}`);
}

// Run directly when executed as script
const isMain = process.argv[1]?.endsWith('seedPms.ts') || process.argv[1]?.endsWith('seedPms.js');
if (isMain) {
  (async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/ums_db');
      await seedPms();
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      console.error('❌ seedPms failed:', e);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    }
  })();
}
