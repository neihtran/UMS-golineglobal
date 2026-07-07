import { Request, Response } from 'express';
import { Student, Enrollment, Subject, Internship, GraduationSession, GraduationRecord } from '@/models/index.js';
import { Types } from 'mongoose';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { logger } from '@/utils/logger.js';
import {
  CreateStudentInput,
  UpdateStudentInput,
  StudentQueryInput,
} from '@/validators/sis.validator.js';

export const getStudentList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as unknown as StudentQueryInput;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 10;

  const filter: Record<string, unknown> = {};
  if (q.status) filter.status = q.status;
  if (q.department) filter.department = new Types.ObjectId(q.department);
  if (q.className) filter.className = q.className;
  if (q.educationLevel) filter.educationLevel = q.educationLevel;
  if (q.search) {
    filter.$or = [
      { name: { $regex: q.search, $options: 'i' } },
      { studentId: { $regex: q.search, $options: 'i' } },
      { email: { $regex: q.search, $options: 'i' } },
    ];
  }

  const [students, total] = await Promise.all([
    Student.find(filter)
      .populate('department', 'name code shortName')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    Student.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: students,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
});

export const getStudentById = asyncHandler(async (req: Request, res: Response) => {
  const student = await Student.findById(req.params.id)
    .select('-cccd')
    .populate('department', 'name code shortName')
    .populate('user', 'email username role');

  if (!student) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sinh viên không tồn tại' } });
    return;
  }

  res.json({ success: true, data: student });
});

export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as CreateStudentInput;

  const existing = await Student.findOne({ studentId: body.studentId });
  if (existing) {
    res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Mã sinh viên đã tồn tại' } });
    return;
  }

  const data: Record<string, unknown> = { ...body };
  if (data.department) data.department = new Types.ObjectId(data.department as string);
  if (data.dob) data.dob = new Date(data.dob as string);
  if (data.admissionDate) data.admissionDate = new Date(data.admissionDate as string);
  if (data.expectedGradDate) data.expectedGradDate = new Date(data.expectedGradDate as string);

  const student = await Student.create(data);
  const saved = await Student.findById(student._id)
    .select('-cccd')
    .populate('department', 'name code shortName');

  res.status(201).json({ success: true, data: saved });
});

export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as UpdateStudentInput;
  const updates: Record<string, unknown> = { ...body };
  if (updates.department) updates.department = new Types.ObjectId(updates.department as string);
  if (updates.dob) updates.dob = new Date(updates.dob as string);
  if (updates.admissionDate) updates.admissionDate = new Date(updates.admissionDate as string);
  if (updates.expectedGradDate) updates.expectedGradDate = new Date(updates.expectedGradDate as string);

  const student = await Student.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true })
    .select('-cccd')
    .populate('department', 'name code shortName');

  if (!student) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sinh viên không tồn tại' } });
    return;
  }

  res.json({ success: true, data: student });
});

export const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await Student.findByIdAndUpdate(req.params.id, { $set: { status: 'dropped' } }, { new: true });
  if (!student) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sinh viên không tồn tại' } });
    return;
  }
  res.json({ success: true, message: 'Đã xóa sinh viên' });
});

export const getSisStats = asyncHandler(async (_req: Request, res: Response) => {
  const [total, studying, graduated, suspended, transferred, dropped, byDepartment, byLevel] = await Promise.all([
    Student.countDocuments(),
    Student.countDocuments({ status: 'studying' }),
    Student.countDocuments({ status: 'graduated' }),
    Student.countDocuments({ status: 'suspended' }),
    Student.countDocuments({ status: 'transferred' }),
    Student.countDocuments({ status: 'dropped' }),
    Student.aggregate([
      { $match: { status: { $ne: 'dropped' } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$dept.name', 'Chưa phân'] }, count: 1 } },
      { $sort: { count: -1 } },
    ]),
    Student.aggregate([
      { $group: { _id: '$educationLevel', count: { $sum: 1 } } },
      { $project: { level: '$_id', count: 1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      total,
      byStatus: { studying, graduated, suspended, transferred, dropped },
      byDepartment,
      byLevel,
    },
  });
});
