import { Request, Response } from 'express';
import { Discipline } from '@/models/Discipline.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';

export const getDisciplineList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 10;

  const filter: Record<string, unknown> = {};
  if (q.type) filter.type = q.type;
  if (q.employeeId) filter.employeeId = q.employeeId;
  if (q.search) {
    filter.$text = { $search: q.search };
  }

  const [items, total] = await Promise.all([
    Discipline.find(filter)
      .populate('employeeId', 'name email code')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 }),
    Discipline.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
});

export const getDisciplineById = asyncHandler(async (req: Request, res: Response) => {
  const item = await Discipline.findById(req.params.id).populate('employeeId', 'name email code');
  if (!item) return res.status(404).json({ success: false, error: { message: 'Không tìm thấy' } });
  res.json({ success: true, data: item });
});

export const createDiscipline = asyncHandler(async (req: Request, res: Response) => {
  const item = await Discipline.create(req.body);
  res.status(201).json({ success: true, data: item });
});

export const updateDiscipline = asyncHandler(async (req: Request, res: Response) => {
  const item = await Discipline.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('employeeId', 'name email code');
  if (!item) return res.status(404).json({ success: false, error: { message: 'Không tìm thấy' } });
  res.json({ success: true, data: item });
});

export const deleteDiscipline = asyncHandler(async (req: Request, res: Response) => {
  await Discipline.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Đã xóa' });
});
