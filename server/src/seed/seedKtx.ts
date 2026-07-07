/**
 * Seed script — KTX (Ký túc xá) data
 * Run: npm run seed:ktx
 *
 * Requires: seedSis() already run (for student references).
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Room, RoomRegistration } from '../models/index.js';
import { Student } from '../models/index.js';
import { logger } from '../utils/logger.js';

config();

const ROOMS: Array<Record<string, unknown>> = [
  { code: 'A-101', building: 'A', floor: 1, roomNumber: '101', type: '6_bed', capacity: 6, currentOccupancy: 5, monthlyFee: 450000, status: 'occupied' },
  { code: 'A-102', building: 'A', floor: 1, roomNumber: '102', type: '6_bed', capacity: 6, currentOccupancy: 6, monthlyFee: 450000, status: 'occupied' },
  { code: 'A-103', building: 'A', floor: 1, roomNumber: '103', type: '4_bed', capacity: 4, currentOccupancy: 4, monthlyFee: 600000, status: 'occupied' },
  { code: 'A-201', building: 'A', floor: 2, roomNumber: '201', type: '6_bed', capacity: 6, currentOccupancy: 3, monthlyFee: 450000, status: 'occupied' },
  { code: 'A-202', building: 'A', floor: 2, roomNumber: '202', type: '6_bed', capacity: 6, currentOccupancy: 0, monthlyFee: 450000, status: 'available' },
  { code: 'A-203', building: 'A', floor: 2, roomNumber: '203', type: '8_bed', capacity: 8, currentOccupancy: 7, monthlyFee: 350000, status: 'occupied' },
  { code: 'A-301', building: 'A', floor: 3, roomNumber: '301', type: '6_bed', capacity: 6, currentOccupancy: 6, monthlyFee: 450000, status: 'occupied' },
  { code: 'A-302', building: 'A', floor: 3, roomNumber: '302', type: '6_bed', capacity: 6, currentOccupancy: 2, monthlyFee: 450000, status: 'maintenance' },
  { code: 'B-101', building: 'B', floor: 1, roomNumber: '101', type: '4_bed', capacity: 4, currentOccupancy: 4, monthlyFee: 600000, status: 'occupied' },
  { code: 'B-102', building: 'B', floor: 1, roomNumber: '102', type: 'single', capacity: 1, currentOccupancy: 1, monthlyFee: 1200000, status: 'occupied' },
  { code: 'B-201', building: 'B', floor: 2, roomNumber: '201', type: 'double', capacity: 2, currentOccupancy: 1, monthlyFee: 900000, status: 'occupied' },
  { code: 'B-202', building: 'B', floor: 2, roomNumber: '202', type: '4_bed', capacity: 4, currentOccupancy: 0, monthlyFee: 600000, status: 'available' },
  { code: 'B-203', building: 'B', floor: 2, roomNumber: '203', type: '6_bed', capacity: 6, currentOccupancy: 4, monthlyFee: 450000, status: 'occupied' },
  { code: 'B-301', building: 'B', floor: 3, roomNumber: '301', type: '8_bed', capacity: 8, currentOccupancy: 5, monthlyFee: 350000, status: 'occupied' },
  { code: 'C-101', building: 'C', floor: 1, roomNumber: '101', type: '6_bed', capacity: 6, currentOccupancy: 6, monthlyFee: 450000, status: 'occupied' },
  { code: 'C-102', building: 'C', floor: 1, roomNumber: '102', type: '4_bed', capacity: 4, currentOccupancy: 0, monthlyFee: 600000, status: 'available' },
  { code: 'C-103', building: 'C', floor: 1, roomNumber: '103', type: '6_bed', capacity: 6, currentOccupancy: 6, monthlyFee: 450000, status: 'occupied' },
  { code: 'C-201', building: 'C', floor: 2, roomNumber: '201', type: 'single', capacity: 1, currentOccupancy: 1, monthlyFee: 1200000, status: 'occupied' },
  { code: 'C-202', building: 'C', floor: 2, roomNumber: '202', type: 'double', capacity: 2, currentOccupancy: 0, monthlyFee: 900000, status: 'reserved' },
  { code: 'C-203', building: 'C', floor: 2, roomNumber: '203', type: '6_bed', capacity: 6, currentOccupancy: 3, monthlyFee: 450000, status: 'occupied' },
];

const STUDENT_IDS = [
  'SV-2022-0016', 'SV-2022-0017', 'SV-2022-0018', 'SV-2022-0019', 'SV-2022-0020',
  'SV-2023-0022', 'SV-2023-0023', 'SV-2023-0024', 'SV-2023-0025', 'SV-2023-0026',
  'SV-2024-0027', 'SV-2024-0028', 'SV-2024-0029', 'SV-2024-0030',
];

export async function seedKtx() {
  await Promise.all([Room.deleteMany({}), RoomRegistration.deleteMany({})]);
  logger.info('Cleared existing KTX data');

  const createdRooms = await Room.insertMany(ROOMS.map(r => ({
    ...r,
    amenities: ['Wifi', 'Điều hòa', 'Tủ lạnh', 'WC riêng'],
    notes: r.status === 'maintenance' ? 'Đang bảo trì hệ thống điện nước' : '',
    images: [],
  })));
  logger.info(`✅ Seeded ${createdRooms.length} rooms`);

  const students = await Student.find({ studentId: { $in: STUDENT_IDS } });
  const roomCodeMap = new Map(createdRooms.map(r => [r.code, r._id.toString()]));

  const registrations: Array<Record<string, unknown>> = [];
  for (const student of students) {
    const availableRooms = createdRooms.filter(r => r.status === 'occupied' || r.status === 'available');
    if (availableRooms.length === 0) continue;
    const room = availableRooms[Math.floor(Math.random() * availableRooms.length)];
    const statuses = ['active', 'active', 'active', 'active', 'completed'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1);
    const endDate = new Date(now.getFullYear() + 1, 5, 30);

    registrations.push({
      studentId: student.studentId,
      studentName: student.name,
      roomId: roomCodeMap.get(room.code)!,
      roomCode: room.code,
      startDate,
      endDate,
      status,
      reason: 'Đăng ký ký túc xá học kỳ 1 năm học 2025-2026',
    });
  }

  const createdRegistrations = await RoomRegistration.insertMany(registrations);
  logger.info(`✅ Seeded ${createdRegistrations.length} room registrations`);

  console.log('\n✅ KTX seed complete!');
  console.log(`   Rooms: ${createdRooms.length}`);
  console.log(`   Registrations: ${createdRegistrations.length}`);
}

// Run directly when executed as script
const isMain = process.argv[1]?.endsWith('seedKtx.ts') || process.argv[1]?.endsWith('seedKtx.js');
if (isMain) {
  (async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/ums_db');
      await seedKtx();
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      console.error('❌ seedKtx failed:', e);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    }
  })();
}
