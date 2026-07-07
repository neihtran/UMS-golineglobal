import { Request, Response } from 'express';
import { Course, Assignment, Attendance } from '@/models/index.js';
import { Types } from 'mongoose';
import { asyncHandler } from '@/middleware/asyncHandler.js';

// ─── LMS Stats ─────────────────────────────────────────────────────────────────
export const getLmsStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    total, published, totalAssignments, totalAttendance,
    avgRating, topCourses,
  ] = await Promise.all([
    Course.countDocuments(),
    Course.countDocuments({ status: 'published' }),
    Assignment.countDocuments(),
    Attendance.countDocuments(),
    Course.aggregate([{ $match: { rating: { $gt: 0 } } }, { $group: { _id: null, avg: { $avg: '$rating' } } }]),
    Course.find({ status: 'published' }).sort({ rating: -1 }).limit(5).select('code name instructorName rating enrolledCount'),
  ]);

  res.json({
    success: true,
    data: {
      total,
      published,
      totalAssignments,
      totalAttendance,
      avgRating: avgRating[0]?.avg ? Number(avgRating[0].avg.toFixed(1)) : 0,
      topCourses,
    },
  });
});

// ─── Course CRUD ───────────────────────────────────────────────────────────────
export const getCourseList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};

  if (q.department) filter.department = new Types.ObjectId(q.department);
  if (q.instructor) filter.instructor = q.instructor;
  if (q.level) filter.level = q.level;
  if (q.status) filter.status = q.status;
  if (q.minRating) filter.rating = { $gte: Number(q.minRating) };
  if (q.search) {
    filter.$or = [
      { name: { $regex: q.search, $options: 'i' } },
      { code: { $regex: q.search, $options: 'i' } },
    ];
  }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate('department', 'name code')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    Course.countDocuments(filter),
  ]);

  res.json({ success: true, data: courses, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const getCourseById = asyncHandler(async (req: Request, res: Response) => {
  const course = await Course.findById(req.params.id).populate('department', 'name code');
  if (!course) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Khóa học không tồn tại' } }); return; }
  res.json({ success: true, data: course });
});

export const createCourse = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  if (body.department) body.department = new Types.ObjectId(body.department);
  const course = await Course.create(body);
  const saved = await Course.findById(course._id).populate('department', 'name code');
  res.status(201).json({ success: true, data: saved });
});

export const updateCourse = asyncHandler(async (req: Request, res: Response) => {
  const updates = req.body;
  if (updates.department) updates.department = new Types.ObjectId(updates.department);
  const course = await Course.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true }).populate('department', 'name code');
  if (!course) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Khóa học không tồn tại' } }); return; }
  res.json({ success: true, data: course });
});

export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await Course.findByIdAndUpdate(req.params.id, { $set: { status: 'archived' } }, { new: true });
  if (!course) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Khóa học không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã lưu trữ khóa học' });
});

// ─── Assignment CRUD ───────────────────────────────────────────────────────────
export const getAssignmentList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};
  if (q.courseId) filter.courseId = q.courseId;
  if (q.type) filter.type = q.type;

  const [assignments, total] = await Promise.all([
    Assignment.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort({ createdAt: -1 }),
    Assignment.countDocuments(filter),
  ]);

  res.json({ success: true, data: assignments, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const createAssignment = asyncHandler(async (req: Request, res: Response) => {
  const assignment = await Assignment.create(req.body);
  res.status(201).json({ success: true, data: assignment });
});

export const updateAssignment = asyncHandler(async (req: Request, res: Response) => {
  const assignment = await Assignment.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!assignment) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Bài tập không tồn tại' } }); return; }
  res.json({ success: true, data: assignment });
});

export const getAssignmentById = asyncHandler(async (req: Request, res: Response) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Bài tập không tồn tại' } }); return; }
  res.json({ success: true, data: assignment });
});

export const deleteAssignment = asyncHandler(async (req: Request, res: Response) => {
  const assignment = await Assignment.findByIdAndDelete(req.params.id);
  if (!assignment) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Bài tập không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã xóa bài tập' });
});
