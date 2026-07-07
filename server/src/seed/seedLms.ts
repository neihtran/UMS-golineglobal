/**
 * Seed script — LMS (Dạy học Số) data
 * Run: npm run seed:lms
 *
 * Requires: seedSis() already run (for student/subject references).
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Department, Course, Assignment, Attendance, Student } from '../models/index.js';
import { logger } from '../utils/logger.js';

config();

const DEPT_IDS: Record<string, string> = {
  KHOA_CNTT: 'DEPT_CNTT_ID',
  KHOA_KINHTE: 'DEPT_KINHTE_ID',
  KHOA_LUAT: 'DEPT_LUAT_ID',
  KHOA_NN: 'DEPT_NN_ID',
  KHOA_KHXD: 'DEPT_KHXD_ID',
  KHOA_DIENTU: 'DEPT_DIENTU_ID',
};

const DEPT_NAME_MAP: Record<string, string> = {
  KHOA_CNTT: 'Khoa CNTT',
  KHOA_KINHTE: 'Khoa Kinh tế',
  KHOA_LUAT: 'Khoa Luật',
  KHOA_NN: 'Khoa Ngoại ngữ',
  KHOA_KHXD: 'Khoa Kỹ thuật Xây dựng',
  KHOA_DIENTU: 'Khoa Điện — Điện tử',
};

const COURSES: Array<Record<string, unknown>> = [
  { code: 'LMS-CNTT-101', name: 'Cấu trúc Dữ liệu & Giải thuật', credits: 3, level: 'intermediate', status: 'published', department: 'KHOA_CNTT', enrolledCount: 45, maxEnrollment: 60, rating: 4.2, durationHours: 45 },
  { code: 'LMS-CNTT-102', name: 'Lập trình Hướng đối tượng', credits: 3, level: 'intermediate', status: 'published', department: 'KHOA_CNTT', enrolledCount: 50, maxEnrollment: 60, rating: 4.5, durationHours: 45 },
  { code: 'LMS-CNTT-201', name: 'Cơ sở Dữ liệu', credits: 3, level: 'intermediate', status: 'published', department: 'KHOA_CNTT', enrolledCount: 40, maxEnrollment: 50, rating: 4.0, durationHours: 45 },
  { code: 'LMS-CNTT-301', name: 'Trí tuệ Nhân tạo Cơ bản', credits: 3, level: 'advanced', status: 'published', department: 'KHOA_CNTT', enrolledCount: 35, maxEnrollment: 40, rating: 4.7, durationHours: 60 },
  { code: 'LMS-CNTT-302', name: 'Phát triển Web Fullstack', credits: 4, level: 'intermediate', status: 'published', department: 'KHOA_CNTT', enrolledCount: 55, maxEnrollment: 60, rating: 4.8, durationHours: 60 },
  { code: 'LMS-KT-101', name: 'Kinh tế Vi mô', credits: 3, level: 'basic', status: 'published', department: 'KHOA_KINHTE', enrolledCount: 60, maxEnrollment: 70, rating: 3.9, durationHours: 45 },
  { code: 'LMS-KT-102', name: 'Kế toán Tài chính', credits: 3, level: 'intermediate', status: 'published', department: 'KHOA_KINHTE', enrolledCount: 48, maxEnrollment: 55, rating: 4.1, durationHours: 45 },
  { code: 'LMS-NN-101', name: 'Tiếng Anh Chuyên ngành CNTT', credits: 2, level: 'intermediate', status: 'published', department: 'KHOA_NN', enrolledCount: 30, maxEnrollment: 35, rating: 4.3, durationHours: 30 },
  { code: 'LMS-NN-102', name: 'Tiếng Anh Giao tiếp Nâng cao', credits: 2, level: 'advanced', status: 'draft', department: 'KHOA_NN', enrolledCount: 0, maxEnrollment: 30, rating: 0, durationHours: 30 },
  { code: 'LMS-CNTT-600', name: 'Đồ án Tốt nghiệp', credits: 6, level: 'advanced', status: 'draft', department: 'KHOA_CNTT', enrolledCount: 0, maxEnrollment: 20, rating: 0, durationHours: 120 },
];

const ASSIGNMENTS: Array<Record<string, unknown>> = [
  { courseCode: 'LMS-CNTT-101', title: 'Bài tập 1: Đảo ngược Chuỗi', type: 'homework', maxScore: 10, dueDate: '2025-04-15' },
  { courseCode: 'LMS-CNTT-101', title: 'Bài tập 2: Sắp xếp Merge Sort', type: 'homework', maxScore: 15, dueDate: '2025-04-30' },
  { courseCode: 'LMS-CNTT-101', title: 'Thi giữa kỳ: Cấu trúc Dữ liệu', type: 'exam', maxScore: 30, dueDate: '2025-05-15' },
  { courseCode: 'LMS-CNTT-101', title: 'Đồ án: Tìm đường đi ngắn nhất', type: 'project', maxScore: 45, dueDate: '2025-06-01' },
  { courseCode: 'LMS-CNTT-102', title: 'Bài tập: Lớp Hình tròn', type: 'homework', maxScore: 10, dueDate: '2025-04-20' },
  { courseCode: 'LMS-CNTT-102', title: 'Thi giữa kỳ: OOP', type: 'exam', maxScore: 30, dueDate: '2025-05-10' },
  { courseCode: 'LMS-CNTT-102', title: 'Đồ án: Quản lý Thư viện', type: 'project', maxScore: 60, dueDate: '2025-06-15' },
  { courseCode: 'LMS-CNTT-301', title: 'Bài tập: Tìm kiếm Theo chiều sâu', type: 'homework', maxScore: 10, dueDate: '2025-05-01' },
  { courseCode: 'LMS-CNTT-301', title: 'Bài tập: Mạng Neural', type: 'homework', maxScore: 15, dueDate: '2025-05-15' },
  { courseCode: 'LMS-KT-101', title: 'Trắc nghiệm Chương 1-3', type: 'quiz', maxScore: 10, dueDate: '2025-04-25' },
  { courseCode: 'LMS-KT-101', title: 'Bài luận: Phân tích Thị trường', type: 'essay', maxScore: 20, dueDate: '2025-05-20' },
  { courseCode: 'LMS-NN-101', title: 'Thuyết trình: Technology Presentation', type: 'project', maxScore: 20, dueDate: '2025-05-10' },
];

const ATTENDANCE_RECORDS: Array<Record<string, unknown>> = [];
const COURSE_IDS: string[] = [];
const ASSIGNMENT_IDS: string[] = [];

export async function seedLms() {
  await Promise.all([Course.deleteMany({}), Assignment.deleteMany({}), Attendance.deleteMany({})]);
  logger.info('Cleared existing LMS data');

  const departments = await Department.find({});
  const deptMap = new Map(departments.map(d => [d.code, d._id.toString()]));

  const createdCourses = await Course.insertMany(COURSES.map(c => ({
    ...c,
    department: deptMap.get(c.department as string),
    description: `Khóa học ${c.name} — nội dung chi tiết sẽ được cập nhật sau.`,
    instructor: 'GV001',
    instructorName: 'ThS. Nguyễn Hoàng Long',
    tags: ['LMS', 'online', c.status as string],
    prerequisites: [],
    syllabus: 'Chương trình chi tiết đang được soạn thảo.',
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-07-15'),
  })));
  createdCourses.forEach(c => COURSE_IDS.push(c._id.toString()));
  logger.info(`✅ Seeded ${createdCourses.length} courses`);

  const courseCodeMap = new Map(createdCourses.map(c => [c.code, c._id.toString()]));
  const createdAssignments = await Assignment.insertMany(ASSIGNMENTS.map(a => ({
    ...a,
    courseId: courseCodeMap.get(a.courseCode as string)!,
    status: 'published',
    description: `Bài tập: ${a.title}`,
  })));
  createdAssignments.forEach(a => ASSIGNMENT_IDS.push(a._id.toString()));
  logger.info(`✅ Seeded ${createdAssignments.length} assignments`);

  const students = await Student.find({ status: 'studying' }).limit(30);
  for (const student of students) {
    for (const course of createdCourses) {
      if (Math.random() > 0.4) continue;
      const sessionCount = 8 + Math.floor(Math.random() * 8);
      for (let w = 1; w <= sessionCount; w++) {
        const date = new Date('2025-02-10');
        date.setDate(date.getDate() + w * 7);
        if (date > new Date()) continue;
        const statuses: string[] = ['present', 'present', 'present', 'present', 'absent', 'late', 'excused'];
        ATTENDANCE_RECORDS.push({
          studentId: student._id,
          studentName: student.name,
          courseId: course._id,
          courseName: course.name,
          session: w,
          sessionDate: date,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          note: '',
        });
      }
    }
  }

  const createdAttendance = await Attendance.insertMany(ATTENDANCE_RECORDS.slice(0, 500));
  logger.info(`✅ Seeded ${createdAttendance.length} attendance records`);

  console.log('\n✅ LMS seed complete!');
  console.log(`   Courses: ${createdCourses.length}`);
  console.log(`   Assignments: ${createdAssignments.length}`);
  console.log(`   Attendance records: ${createdAttendance.length}`);
}

// Run directly when executed as script
const isMain = process.argv[1]?.endsWith('seedLms.ts') || process.argv[1]?.endsWith('seedLms.js');
if (isMain) {
  (async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/ums_db');
      await seedLms();
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      console.error('❌ seedLms failed:', e);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    }
  })();
}
