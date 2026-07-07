import { Request, Response } from 'express';
import { PartyMember, PartyActivity } from '@/models/index.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';

// ─── PMS Stats ─────────────────────────────────────────────────────────────────
export const getPmsStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    total, active, probation,
    totalActivities, ongoing, completed,
    activitiesByType,
  ] = await Promise.all([
    PartyMember.countDocuments(),
    PartyMember.countDocuments({ status: 'active' }),
    PartyMember.countDocuments({ status: 'probation' }),
    PartyActivity.countDocuments(),
    PartyActivity.countDocuments({ status: 'ongoing' }),
    PartyActivity.countDocuments({ status: 'completed' }),
    PartyActivity.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
  ]);

  res.json({
    success: true,
    data: {
      members: { total, active, probation },
      activities: { total: totalActivities, ongoing, completed },
      byType: activitiesByType,
    },
  });
});

// ─── PartyMember CRUD ──────────────────────────────────────────────────────────
export const getPartyMemberList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};
  if (q.department) filter.department = q.department;
  if (q.cell) filter.cell = q.cell;
  if (q.status) filter.status = q.status;
  if (q.search) {
    filter.$or = [
      { name: { $regex: q.search, $options: 'i' } },
      { email: { $regex: q.search, $options: 'i' } },
    ];
  }

  const [list, total] = await Promise.all([
    PartyMember.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { joinPartyDate: -1 }),
    PartyMember.countDocuments(filter),
  ]);

  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const getPartyMemberById = asyncHandler(async (req: Request, res: Response) => {
  const member = await PartyMember.findById(req.params.id);
  if (!member) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đảng viên không tồn tại' } }); return; }
  res.json({ success: true, data: member });
});

export const createPartyMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await PartyMember.create(req.body);
  res.status(201).json({ success: true, data: member });
});

export const updatePartyMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await PartyMember.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!member) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đảng viên không tồn tại' } }); return; }
  res.json({ success: true, data: member });
});

// ─── Party Activity CRUD ───────────────────────────────────────────────────────
export const getActivityList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};
  if (q.type) filter.type = q.type;
  if (q.status) filter.status = q.status;
  if (q.organizer) filter.organizer = q.organizer;
  if (q.fromDate || q.toDate) {
    filter.startDate = {};
    if (q.fromDate) (filter.startDate as any).$gte = new Date(q.fromDate);
    if (q.toDate) (filter.startDate as any).$lte = new Date(q.toDate);
  }

  const [list, total] = await Promise.all([
    PartyActivity.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { startDate: -1 }),
    PartyActivity.countDocuments(filter),
  ]);

  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const createActivity = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  if (body.startDate) body.startDate = new Date(body.startDate);
  if (body.endDate) body.endDate = new Date(body.endDate);
  const activity = await PartyActivity.create(body);
  res.status(201).json({ success: true, data: activity });
});

export const getActivityById = asyncHandler(async (req: Request, res: Response) => {
  const activity = await PartyActivity.findById(req.params.id);
  if (!activity) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Hoạt động không tồn tại' } }); return; }
  res.json({ success: true, data: activity });
});

export const updateActivity = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  if (body.startDate) body.startDate = new Date(body.startDate);
  if (body.endDate) body.endDate = new Date(body.endDate);
  const activity = await PartyActivity.findByIdAndUpdate(req.params.id, { $set: body }, { new: true, runValidators: true });
  if (!activity) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Hoạt động không tồn tại' } }); return; }
  res.json({ success: true, data: activity });
});

export const deleteActivity = asyncHandler(async (req: Request, res: Response) => {
  const activity = await PartyActivity.findByIdAndDelete(req.params.id);
  if (!activity) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Hoạt động không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã xóa hoạt động' });
});

export const deletePartyMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await PartyMember.findByIdAndDelete(req.params.id);
  if (!member) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đảng viên không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã xóa đảng viên' });
});
