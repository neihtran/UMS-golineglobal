import { Request, Response } from 'express';
import { Report } from '@/models/index.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';

// ─── BI Stats ──────────────────────────────────────────────────────────────────
export const getBiStats = asyncHandler(async (_req: Request, res: Response) => {
  const [total, onDemand, scheduled, publicReports] = await Promise.all([
    Report.countDocuments(),
    Report.countDocuments({ schedule: 'on_demand' }),
    Report.countDocuments({ schedule: { $ne: 'on_demand' } }),
    Report.countDocuments({ isPublic: true }),
  ]);

  res.json({
    success: true,
    data: {
      total,
      bySchedule: { onDemand, scheduled: scheduled },
      public: publicReports,
    },
  });
});

// ─── Report CRUD ───────────────────────────────────────────────────────────────
export const getReportList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};
  if (q.type) filter.type = q.type;
  if (q.module) filter.module = q.module;
  if (q.schedule) filter.schedule = q.schedule;
  if (q.isPublic !== undefined) filter.isPublic = q.isPublic;
  if (q.search) filter.name = { $regex: q.search, $options: 'i' };

  const [list, total] = await Promise.all([
    Report.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    Report.countDocuments(filter),
  ]);

  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const getReportById = asyncHandler(async (req: Request, res: Response) => {
  const report = await Report.findById(req.params.id);
  if (!report) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Báo cáo không tồn tại' } }); return; }
  res.json({ success: true, data: report });
});

export const createReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await Report.create({ ...req.body, generatedBy: req.user?._id });
  res.status(201).json({ success: true, data: report });
});

export const updateReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await Report.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!report) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Báo cáo không tồn tại' } }); return; }
  res.json({ success: true, data: report });
});

export const generateReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await Report.findById(req.params.id);
  if (!report) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Báo cáo không tồn tại' } }); return; }
  // TODO: actual aggregation logic — placeholder for now
  res.json({ success: true, data: { ...report.toObject(), generatedAt: new Date() }, message: 'Báo cáo đã được tạo' });
});
