import { Request, Response } from 'express';
import { Enrollment, Subject, Curriculum, Internship, Student } from '@/models/index.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';

// ─── Subject CRUD ──────────────────────────────────────────────────────────────
export const getSubjectList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};
  if (q.department) filter.department = new (require('mongoose')).default.Types.ObjectId(q.department);
  if (q.credits) filter.credits = Number(q.credits);
  if (q.isActive !== undefined) filter.isActive = q.isActive;
  if (q.search) {
    filter.$or = [
      { name: { $regex: q.search, $options: 'i' } },
      { code: { $regex: q.search, $options: 'i' } },
    ];
  }

  const [subjects, total] = await Promise.all([
    Subject.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { code: 1 }),
    Subject.countDocuments(filter),
  ]);

  res.json({ success: true, data: subjects, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const createSubject = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  if (body.department) body.department = new (require('mongoose')).default.Types.ObjectId(body.department);
  const subject = await Subject.create(body);
  const saved = await Subject.findById(subject._id).populate('department', 'name code');
  res.status(201).json({ success: true, data: saved });
});

export const updateSubject = asyncHandler(async (req: Request, res: Response) => {
  const updates = req.body;
  if (updates.department) updates.department = new (require('mongoose')).default.Types.ObjectId(updates.department);
  const subject = await Subject.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true }).populate('department', 'name code');
  if (!subject) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Môn học không tồn tại' } }); return; }
  res.json({ success: true, data: subject });
});

// ─── Enrollment CRUD ───────────────────────────────────────────────────────────
export const getEnrollmentList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 10;
  const filter: Record<string, unknown> = {};
  if (q.studentId) filter.studentId = q.studentId;
  if (q.subjectId) filter.subjectId = q.subjectId;
  if (q.semester) filter.semester = q.semester;
  if (q.academicYear) filter.academicYear = q.academicYear;
  if (q.classGroup) filter.classGroup = q.classGroup;
  if (q.status) filter.status = q.status;

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    Enrollment.countDocuments(filter),
  ]);

  res.json({ success: true, data: enrollments, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const createEnrollment = asyncHandler(async (req: Request, res: Response) => {
  const enrollment = await Enrollment.create(req.body);
  res.status(201).json({ success: true, data: enrollment });
});

export const updateEnrollment = asyncHandler(async (req: Request, res: Response) => {
  const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!enrollment) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đăng ký học không tồn tại' } }); return; }
  res.json({ success: true, data: enrollment });
});

// ─── Curriculum CRUD ───────────────────────────────────────────────────────────
export const getCurriculumList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};
  if (q.educationLevel) filter.educationLevel = q.educationLevel;
  if (q.status) filter.status = q.status;

  const [list, total] = await Promise.all([
    Curriculum.find(filter).populate('department', 'name code').skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { startYear: -1 }),
    Curriculum.countDocuments(filter),
  ]);

  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const createCurriculum = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  if (body.department) body.department = new (require('mongoose')).default.Types.ObjectId(body.department);
  const curriculum = await Curriculum.create(body);
  const saved = await Curriculum.findById(curriculum._id).populate('department', 'name code');
  res.status(201).json({ success: true, data: saved });
});

// ─── Internship CRUD ───────────────────────────────────────────────────────────
export const getInternshipList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 10;
  const filter: Record<string, unknown> = {};
  if (q.studentId) filter.studentId = q.studentId;
  if (q.status) filter.status = q.status;
  if (q.companyName) filter.companyName = { $regex: q.companyName, $options: 'i' };
  if (q.search) {
    filter.$or = [
      { studentName: { $regex: q.search, $options: 'i' } },
      { companyName: { $regex: q.search, $options: 'i' } },
    ];
  }

  const [list, total] = await Promise.all([
    Internship.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { startDate: -1 }),
    Internship.countDocuments(filter),
  ]);

  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const createInternship = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  if (body.startDate) body.startDate = new Date(body.startDate);
  if (body.endDate) body.endDate = new Date(body.endDate);
  const internship = await Internship.create(body);
  res.status(201).json({ success: true, data: internship });
});
