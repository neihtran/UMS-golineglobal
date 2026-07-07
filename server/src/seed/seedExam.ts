/**
 * Seed script — EXAM (Thi trực tuyến) data
 * Run: npm run seed:exam
 *
 * Requires: seedSis() and seedLms() already run.
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Exam, Question, ExamSession, ExamResult } from '../models/index.js';
import { logger } from '../utils/logger.js';

config();

const EXAMS: Array<Record<string, unknown>> = [
  { code: 'EX-CNTT-101-MID', name: 'Thi giữa kỳ Cấu trúc Dữ liệu', type: 'midterm', status: 'graded', subjectName: 'Cấu trúc Dữ liệu & Giải thuật', department: 'KHOA_CNTT', instructor: 'ThS. Nguyễn Hoàng Long', durationMinutes: 90, totalQuestions: 30, totalScore: 100, passScore: 50, allowedAttempts: 1, startTime: new Date('2025-04-15T08:00:00'), endTime: new Date('2025-04-15T09:30:00') },
  { code: 'EX-CNTT-101-FIN', name: 'Thi cuối kỳ Cấu trúc Dữ liệu', type: 'final', status: 'ongoing', subjectName: 'Cấu trúc Dữ liệu & Giải thuật', department: 'KHOA_CNTT', instructor: 'ThS. Nguyễn Hoàng Long', durationMinutes: 120, totalQuestions: 40, totalScore: 100, passScore: 50, allowedAttempts: 1, startTime: new Date('2025-06-20T08:00:00'), endTime: new Date('2025-06-20T10:00:00') },
  { code: 'EX-CNTT-102-MID', name: 'Thi giữa kỳ Lập trình OOP', type: 'midterm', status: 'finished', subjectName: 'Lập trình Hướng đối tượng', department: 'KHOA_CNTT', instructor: 'ThS. Trần Hoàng Nam', durationMinutes: 90, totalQuestions: 25, totalScore: 100, passScore: 50, allowedAttempts: 1, startTime: new Date('2025-04-18T08:00:00'), endTime: new Date('2025-04-18T09:30:00') },
  { code: 'EX-CNTT-201-FIN', name: 'Thi cuối kỳ Cơ sở Dữ liệu', type: 'final', status: 'finished', subjectName: 'Cơ sở Dữ liệu', department: 'KHOA_CNTT', instructor: 'PGS.TS. Hoàng Minh Tuấn', durationMinutes: 120, totalQuestions: 35, totalScore: 100, passScore: 50, allowedAttempts: 1, startTime: new Date('2025-06-22T08:00:00'), endTime: new Date('2025-06-22T10:00:00') },
  { code: 'EX-CNTT-301-QUIZ', name: 'Kiểm tra Trắc nghiệm AI', type: 'quiz', status: 'published', subjectName: 'Trí tuệ Nhân tạo', department: 'KHOA_CNTT', instructor: 'TS. Lê Thị Thu Hà', durationMinutes: 45, totalQuestions: 20, totalScore: 100, passScore: 60, allowedAttempts: 2, startTime: new Date('2025-07-01T14:00:00'), endTime: new Date('2025-07-01T14:45:00') },
  { code: 'EX-KT-101-MID', name: 'Thi giữa kỳ Kinh tế Vi mô', type: 'midterm', status: 'graded', subjectName: 'Kinh tế Vi mô', department: 'KHOA_KINHTE', instructor: 'ThS. Trần Thị Mai Lan', durationMinutes: 90, totalQuestions: 30, totalScore: 100, passScore: 50, allowedAttempts: 1, startTime: new Date('2025-04-16T08:00:00'), endTime: new Date('2025-04-16T09:30:00') },
  { code: 'EX-NN-101-MID', name: 'Thi giữa kỳ Tiếng Anh 1', type: 'midterm', status: 'finished', subjectName: 'Tiếng Anh 1', department: 'KHOA_NN', instructor: 'ThS. Phạm Thị Hương Giang', durationMinutes: 60, totalQuestions: 50, totalScore: 100, passScore: 50, allowedAttempts: 1, startTime: new Date('2025-04-17T08:00:00'), endTime: new Date('2025-04-17T09:00:00') },
  { code: 'EX-LUAT-101-FIN', name: 'Thi cuối kỳ Luật Hiến pháp', type: 'final', status: 'published', subjectName: 'Luật Hiến pháp', department: 'KHOA_LUAT', instructor: 'ThS. Lê Văn Minh', durationMinutes: 120, totalQuestions: 40, totalScore: 100, passScore: 50, allowedAttempts: 1, startTime: new Date('2025-06-25T08:00:00'), endTime: new Date('2025-06-25T10:00:00') },
];

const QUESTIONS: Array<Record<string, unknown>> = [];
let qId = 1;

const QUESTION_TEMPLATES: Record<string, Array<{ text: string; options?: string[]; correct?: string; type: string; score: number }>> = {
  'EX-CNTT-101-MID': [
    { text: 'Cấu trúc dữ liệu nào có thời gian truy cập O(1) trung bình?', options: ['Mảng', 'Danh sách liên kết', 'Cây nhị phân', 'Bảng băm'], correct: 'Bảng băm', type: 'single_choice', score: 2 },
    { text: 'Độ phức tạp của thuật toán QuickSort trung bình là?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correct: 'O(n log n)', type: 'single_choice', score: 2 },
    { text: 'Stack là cấu trúc dữ liệu dạng?', options: ['FIFO', 'LIFO', 'FILO', 'Cả B và C'], correct: 'Cả B và C', type: 'single_choice', score: 2 },
    { text: 'Thuật toán tìm kiếm nhị phân yêu cầu mảng phải?', options: ['Đã sắp xếp', 'Ngẫu nhiên', 'Chứa số nguyên', 'Chứa chuỗi'], correct: 'Đã sắp xếp', type: 'single_choice', score: 2 },
    { text: 'Cây AVL là cây?', options: ['Bậc 2 đầy đủ', 'Cân bằng', 'Hoàn hảo', 'Đầy đủ'], correct: 'Cân bằng', type: 'single_choice', score: 3 },
    { text: 'Độ phức tạp duyệt DFS trên đồ thị là?', options: ['O(V+E)', 'O(V)', 'O(E)', 'O(V*E)'], correct: 'O(V+E)', type: 'single_choice', score: 3 },
    { text: 'Hàng đợi ưu tiên thường được cài bằng?', options: ['Mảng', 'Ngăn xếp', 'Heap', 'Danh sách'], correct: 'Heap', type: 'single_choice', score: 2 },
    { text: 'Khai báo đúng của danh sách liên kết đơn?', options: ['data + next', 'data + prev', 'data + next + prev', 'data only'], correct: 'data + next', type: 'single_choice', score: 2 },
  ],
  'EX-CNTT-102-MID': [
    { text: 'Nguyên lý đóng gói trong OOP là?', options: ['Inheritance', 'Encapsulation', 'Polymorphism', 'Abstraction'], correct: 'Encapsulation', type: 'single_choice', score: 2 },
    { text: 'Interface trong Java có thể chứa?', options: ['Constructor', 'Fields public static', 'Private methods', 'Instance variables'], correct: 'Fields public static', type: 'single_choice', score: 2 },
    { text: 'Sự khác biệt giữa abstract class và interface?', options: ['Không có', 'Constructor', 'Multiple inheritance', 'Access modifier'], correct: 'Multiple inheritance', type: 'single_choice', score: 3 },
  ],
  'EX-KT-101-MID': [
    { text: 'Độ co giãn của cầu có dạng?', options: ['Es = ΔQ/ΔP', 'Es = ΔP/ΔQ', 'Es = Q/P', 'Es = P/Q'], correct: 'Es = ΔQ/ΔP', type: 'single_choice', score: 2 },
    { text: 'Khi Es > 1, hàng hóa được gọi là?', options: ['Cầu co giãn', 'Cầu không co giãn', 'Cầu co giãn đơn vị', 'Cầu tiêu cực'], correct: 'Cầu co giãn', type: 'single_choice', score: 2 },
    { text: 'Chi phí cơ hội là?', options: ['Chi phí dự kiến', 'Giá trị lựa chọn tốt nhất bị bỏ qua', 'Chi phí thực tế', 'Doanh thu'], correct: 'Giá trị lựa chọn tốt nhất bị bỏ qua', type: 'single_choice', score: 3 },
  ],
};

for (const exam of EXAMS) {
  const templates = QUESTION_TEMPLATES[exam.code as string] || QUESTION_TEMPLATES['EX-CNTT-101-MID'] || [];
  for (const tpl of templates) {
    const options = (tpl.options || []).map((opt, idx) => ({
      label: String.fromCharCode(65 + idx),
      content: opt,
      isCorrect: opt === tpl.correct,
    }));
    QUESTIONS.push({
      examId: exam.code,
      subjectName: exam.subjectName,
      type: tpl.type,
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
      content: tpl.text,
      options,
      correctAnswer: tpl.correct,
      points: tpl.score,
      explanation: `Giải thích: Đáp án đúng là "${tpl.correct}". ${tpl.text}`,
      tags: ['định kỳ', 'trắc nghiệm'],
    });
  }
}

const EXAM_SESSIONS: Array<Record<string, unknown>> = [];
const EXAM_RESULTS: Array<Record<string, unknown>> = [];

export async function seedExam() {
  await Promise.all([Exam.deleteMany({}), Question.deleteMany({}), ExamSession.deleteMany({}), ExamResult.deleteMany({})]);
  logger.info('Cleared existing EXAM data');

  const createdExams = await Exam.insertMany(EXAMS);
  logger.info(`✅ Seeded ${createdExams.length} exams`);

  const createdQuestions = await Question.insertMany(QUESTIONS);
  logger.info(`✅ Seeded ${createdQuestions.length} questions`);

  // Exam sessions for graded/finished exams
  const gradedExams = createdExams.filter(e => ['graded', 'finished'].includes(e.status as string));
  for (const exam of gradedExams) {
    const sessions: Array<Record<string, unknown>> = [
      { examId: exam.code, studentId: 'SV-2020-0001', studentName: 'Nguyễn Văn An', status: 'submitted', score: 85 + Math.floor(Math.random() * 15), submittedAt: new Date(exam.endTime as Date) },
      { examId: exam.code, studentId: 'SV-2020-0002', studentName: 'Trần Thị Bình', status: 'submitted', score: 70 + Math.floor(Math.random() * 20), submittedAt: new Date(exam.endTime as Date) },
      { examId: exam.code, studentId: 'SV-2021-0009', studentName: 'Vũ Văn Ích', status: 'submitted', score: 60 + Math.floor(Math.random() * 30), submittedAt: new Date(exam.endTime as Date) },
      { examId: exam.code, studentId: 'SV-2022-0016', studentName: 'Trần Thị Quỳnh', status: 'submitted', score: 75 + Math.floor(Math.random() * 20), submittedAt: new Date(exam.endTime as Date) },
    ];
    EXAM_SESSIONS.push(...sessions);
  }

  const createdSessions = await ExamSession.insertMany(EXAM_SESSIONS);
  logger.info(`✅ Seeded ${createdSessions.length} exam sessions`);

  for (const session of createdSessions as { examId: string; studentId: string; studentName: string; score: number; submittedAt: Date }[]) {
    const score = session.score;
    const percentage = score;
    const passed = score >= 50;
    EXAM_RESULTS.push({
      examId: session.examId,
      studentId: session.studentId,
      studentName: session.studentName,
      score,
      maxScore: 100,
      percentage,
      isPassed: passed,
      submittedAt: session.submittedAt,
    });
  }

  const createdResults = await ExamResult.insertMany(EXAM_RESULTS);
  logger.info(`✅ Seeded ${createdResults.length} exam results`);

  console.log('\n✅ EXAM seed complete!');
  console.log(`   Exams: ${createdExams.length}`);
  console.log(`   Questions: ${createdQuestions.length}`);
  console.log(`   Exam sessions: ${createdSessions.length}`);
  console.log(`   Exam results: ${createdResults.length}`);
}

// Run directly when executed as script
const isMain = process.argv[1]?.endsWith('seedExam.ts') || process.argv[1]?.endsWith('seedExam.js');
if (isMain) {
  (async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/ums_db');
      await seedExam();
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      console.error('❌ seedExam failed:', e);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    }
  })();
}
