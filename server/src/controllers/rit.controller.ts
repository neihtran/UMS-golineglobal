import { Request, Response } from 'express';
import { ResearchProject } from '@/models/index.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';

// ─── RIT Stats ─────────────────────────────────────────────────────────────────
export const getRitStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    total, active, planning, completed,
    totalFunding, projectsByType,
  ] = await Promise.all([
    ResearchProject.countDocuments(),
    ResearchProject.countDocuments({ status: 'active' }),
    ResearchProject.countDocuments({ status: 'planning' }),
    ResearchProject.countDocuments({ status: 'completed' }),
    ResearchProject.aggregate([{ $group: { _id: null, total: { $sum: '$funding' } } }]),
    ResearchProject.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
  ]);

  res.json({
    success: true,
    data: {
      total,
      byStatus: { active, planning, completed },
      totalFunding: totalFunding[0]?.total || 0,
      byType: projectsByType,
    },
  });
});

// ─── Research Project CRUD ─────────────────────────────────────────────────────
export const getResearchProjectList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};

  if (q.type) filter.type = q.type;
  if (q.status) filter.status = q.status;
  if (q.department) filter.department = q.department;
  if (q.principal) filter.principal = q.principal;
  if (q.search) {
    filter.$or = [
      { name: { $regex: q.search, $options: 'i' } },
      { code: { $regex: q.search, $options: 'i' } },
    ];
  }
  if (q.fromDate || q.toDate) {
    filter.startDate = {};
    if (q.fromDate) (filter.startDate as any).$gte = new Date(q.fromDate);
    if (q.toDate) (filter.startDate as any).$lte = new Date(q.toDate);
  }

  const [projects, total] = await Promise.all([
    ResearchProject.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { startDate: -1 }),
    ResearchProject.countDocuments(filter),
  ]);

  res.json({ success: true, data: projects, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const getResearchProjectById = asyncHandler(async (req: Request, res: Response) => {
  const project = await ResearchProject.findById(req.params.id);
  if (!project) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đề tài không tồn tại' } }); return; }
  res.json({ success: true, data: project });
});

export const createResearchProject = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  if (body.startDate) body.startDate = new Date(body.startDate);
  if (body.endDate) body.endDate = new Date(body.endDate);
  const project = await ResearchProject.create(body);
  res.status(201).json({ success: true, data: project });
});

export const updateResearchProject = asyncHandler(async (req: Request, res: Response) => {
  const updates = req.body;
  if (updates.startDate) updates.startDate = new Date(updates.startDate);
  if (updates.endDate) updates.endDate = new Date(updates.endDate);
  const project = await ResearchProject.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
  if (!project) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đề tài không tồn tại' } }); return; }
  res.json({ success: true, data: project });
});

export const deleteResearchProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await ResearchProject.findByIdAndDelete(req.params.id);
  if (!project) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đề tài không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã xóa đề tài' });
});
