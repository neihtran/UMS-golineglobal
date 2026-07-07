import { Request, Response } from 'express';
import { Exam, Question, ExamSession, ExamResult, type IExam, type IExamSession } from '@/models/index.js';
import { Types } from 'mongoose';
import { asyncHandler } from '@/middleware/asyncHandler.js';

// ─── EXAM Stats ────────────────────────────────────────────────────────────────
export const getExamStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    total, ongoing, finished,
    totalSessions, gradedSessions, activeSessions,
    avgScore,
    questionStats,
  ] = await Promise.all([
    Exam.countDocuments(),
    Exam.countDocuments({ status: 'ongoing' }),
    Exam.countDocuments({ status: 'finished' }),
    ExamSession.countDocuments(),
    ExamSession.countDocuments({ status: 'submitted' }),
    ExamSession.countDocuments({ status: 'in_progress' }),
    ExamResult.aggregate([{ $group: { _id: null, avg: { $avg: '$percentage' } } }]),
    Question.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $project: { type: '$_id', count: 1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      total,
      byStatus: { ongoing, finished, gradedSessions },
      totalSessions,
      activeSessions,
      avgScore: avgScore[0]?.avg ? Number(avgScore[0].avg.toFixed(1)) : 0,
      questionStats,
    },
  });
});

export const getExamResultStatistics = asyncHandler(async (req: Request, res: Response) => {
  const examId = req.query.examId as string;
  if (!examId) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'examId là bắt buộc' } });
    return;
  }

  const [total, passed, failed, avgScore, gradeDistribution, scoreByQuestion] = await Promise.all([
    ExamResult.countDocuments({ examId }),
    ExamResult.countDocuments({ examId, isPassed: true }),
    ExamResult.countDocuments({ examId, isPassed: false }),
    ExamResult.aggregate([
      { $match: { examId } },
      { $group: { _id: null, avg: { $avg: '$percentage' } } },
    ]),
    ExamResult.aggregate([
      { $match: { examId } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $gte: ['$percentage', 9] }, result: 'A+' },
                { case: { $gte: ['$percentage', 8.5] }, result: 'A' },
                { case: { $gte: ['$percentage', 8] }, result: 'B+' },
                { case: { $gte: ['$percentage', 7] }, result: 'B' },
                { case: { $gte: ['$percentage', 6.5] }, result: 'C+' },
                { case: { $gte: ['$percentage', 5.5] }, result: 'C' },
                { case: { $gte: ['$percentage', 5] }, result: 'D+' },
                { case: { $gte: ['$percentage', 4] }, result: 'D' },
              ],
              default: 'F',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $project: { grade: '$_id', count: 1 } },
    ]),
    ExamResult.aggregate([
      { $match: { examId } },
      { $unwind: '$questionResults' },
      {
        $group: {
          _id: '$questionResults.questionId',
          avgScore: { $avg: '$questionResults.score' },
          maxScore: { $first: '$questionResults.maxScore' },
        },
      },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      examId,
      total,
      passed,
      failed,
      passRate: total > 0 ? Number(((passed / total) * 100).toFixed(1)) : 0,
      avgScore: avgScore[0]?.avg ? Number(avgScore[0].avg.toFixed(1)) : 0,
      gradeDistribution,
      scoreByQuestion,
    },
  });
});

// ─── Exam CRUD ─────────────────────────────────────────────────────────────────
export const getExamList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};

  if (q.subjectId) filter.subjectId = q.subjectId;
  if (q.type) filter.type = q.type;
  if (q.status) filter.status = q.status;
  if (q.instructor) filter.instructor = q.instructor;
  if (q.fromDate || q.toDate) {
    filter.startTime = {};
    if (q.fromDate) (filter.startTime as any).$gte = new Date(q.fromDate);
    if (q.toDate) (filter.startTime as any).$lte = new Date(q.toDate);
  }
  if (q.search) {
    filter.$or = [
      { name: { $regex: q.search, $options: 'i' } },
      { code: { $regex: q.search, $options: 'i' } },
    ];
  }

  const [exams, total] = await Promise.all([
    Exam.find(filter)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { startTime: -1 }),
    Exam.countDocuments(filter),
  ]);

  res.json({ success: true, data: exams, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const getExamById = asyncHandler(async (req: Request, res: Response) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Kỳ thi không tồn tại' } }); return; }
  res.json({ success: true, data: exam });
});

export const createExam = asyncHandler(async (req: Request, res: Response) => {
  const exam = await Exam.create(req.body);
  res.status(201).json({ success: true, data: exam });
});

export const updateExam = asyncHandler(async (req: Request, res: Response) => {
  const exam = await Exam.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!exam) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Kỳ thi không tồn tại' } }); return; }
  res.json({ success: true, data: exam });
});

export const deleteExam = asyncHandler(async (req: Request, res: Response) => {
  const exam = await Exam.findByIdAndUpdate(req.params.id, { $set: { status: 'draft' } }, { new: true });
  if (!exam) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Kỳ thi không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã hủy kỳ thi' });
});

// ─── Question CRUD ─────────────────────────────────────────────────────────────
export const getQuestionList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};
  if (q.examId) filter.examId = q.examId;
  if (q.subjectId) filter.subjectId = q.subjectId;
  if (q.type) filter.type = q.type;
  if (q.difficulty) filter.difficulty = q.difficulty;
  if (q.tags) filter.tags = { $in: q.tags.split(',') };
  if (q.search) filter.content = { $regex: q.search, $options: 'i' };

  const [questions, total] = await Promise.all([
    Question.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    Question.countDocuments(filter),
  ]);

  res.json({ success: true, data: questions, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const createQuestion = asyncHandler(async (req: Request, res: Response) => {
  const question = await Question.create(req.body);
  res.status(201).json({ success: true, data: question });
});

export const updateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const question = await Question.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!question) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Câu hỏi không tồn tại' } }); return; }
  res.json({ success: true, data: question });
});

export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
  await Question.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Đã xóa câu hỏi' });
});

// ─── Exam Session ──────────────────────────────────────────────────────────────
export const getExamSessionList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};
  if (q.examId) filter.examId = q.examId;
  if (q.studentId) filter.studentId = q.studentId;
  if (q.status) filter.status = q.status;

  const [sessions, total] = await Promise.all([
    ExamSession.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    ExamSession.countDocuments(filter),
  ]);

  res.json({ success: true, data: sessions, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const startExamSession = asyncHandler(async (req: Request, res: Response) => {
  const { examId, studentId, studentName } = req.body;
  const existing = await ExamSession.findOne({ examId, studentId, status: { $nin: ['submitted', 'auto_submitted', 'terminated'] } });
  if (existing) { res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Bạn đang trong một phiên thi khác' } }); return; }

  const session = await ExamSession.create({ examId, studentId, studentName, status: 'in_progress', startedAt: new Date(), attemptsUsed: 1 });
  res.status(201).json({ success: true, data: session });
});

export const submitExamSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await ExamSession.findByIdAndUpdate(req.params.id, { $set: { status: 'submitted', submittedAt: new Date() } }, { new: true });
  if (!session) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Phiên thi không tồn tại' } }); return; }
  res.json({ success: true, data: session });
});

// ─── Exam Results ──────────────────────────────────────────────────────────────
export const getExamResultList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};
  if (q.examId) filter.examId = q.examId;
  if (q.studentId) filter.studentId = q.studentId;
  if (q.minScore !== undefined) filter.score = { $gte: Number(q.minScore) };
  if (q.maxScore !== undefined) filter.score = { ...(filter.score as any), $lte: Number(q.maxScore) };

  const [results, total] = await Promise.all([
    ExamResult.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { submittedAt: -1 }),
    ExamResult.countDocuments(filter),
  ]);

  res.json({ success: true, data: results, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const gradeExamSession = asyncHandler(async (req: Request, res: Response) => {
  const { answers } = req.body;
  const session = await ExamSession.findById(req.params.id).populate<IExam>('examId', 'totalScore passScore').lean() as (IExamSession & { examId?: IExam }) | null;
  if (!session || !session.examId) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Phiên thi không tồn tại' } }); return; }

  const totalEarned = answers.reduce((sum: number, a: any) => sum + (a.scoreEarned || 0), 0);
  const percentage = Math.round((totalEarned / session.examId.totalScore) * 100);

  const result = await ExamResult.create({
    examId: session.examId._id.toString(),
    examName: session.examId.name,
    studentId: session.studentId,
    studentName: session.studentName,
    score: totalEarned,
    maxScore: session.examId.totalScore,
    percentage,
    isPassed: totalEarned >= session.examId.passScore,
    answers,
    submittedAt: new Date(),
    gradedAt: new Date(),
  });

  await ExamSession.findByIdAndUpdate(session._id, { $set: { status: 'graded', score: totalEarned, isPassed: totalEarned >= session.examId.passScore } });

  res.json({ success: true, data: result });
});
