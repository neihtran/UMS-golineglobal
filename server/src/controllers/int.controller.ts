import { Request, Response } from 'express';
import { Integration, IntegrationLog } from '@/models/Integration.js';
import { Types } from 'mongoose';
import { asyncHandler } from '@/middleware/asyncHandler.js';

// ─── INT Stats ─────────────────────────────────────────────────────────────────
export const getIntStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    total, active, inactive, error,
    todaySuccess, todayError,
  ] = await Promise.all([
    Integration.countDocuments(),
    Integration.countDocuments({ status: 'active' }),
    Integration.countDocuments({ status: 'inactive' }),
    Integration.countDocuments({ status: 'error' }),
    IntegrationLog.countDocuments({ status: 'success', timestamp: { $gte: new Date(Date.now() - 86400000) } }),
    IntegrationLog.countDocuments({ status: 'error', timestamp: { $gte: new Date(Date.now() - 86400000) } }),
  ]);

  res.json({
    success: true,
    data: {
      total,
      byStatus: { active, inactive, error },
      todayLogs: { success: todaySuccess, error: todayError },
    },
  });
});

// ─── Integration CRUD ──────────────────────────────────────────────────────────
export const getIntegrationList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 10;
  const filter: Record<string, unknown> = {};
  if (q.system) filter.system = q.system;
  if (q.status) filter.status = q.status;
  if (q.search) filter.name = { $regex: q.search, $options: 'i' };

  const [list, total] = await Promise.all([
    Integration.find(filter).select('-apiKey').skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { name: 1 }),
    Integration.countDocuments(filter),
  ]);

  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const getIntegrationById = asyncHandler(async (req: Request, res: Response) => {
  const integration = await Integration.findById(req.params.id).select('-apiKey');
  if (!integration) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Integration không tồn tại' } }); return; }
  res.json({ success: true, data: integration });
});

export const createIntegration = asyncHandler(async (req: Request, res: Response) => {
  const integration = await Integration.create(req.body);
  const saved = await Integration.findById(integration._id).select('-apiKey');
  res.status(201).json({ success: true, data: saved });
});

export const updateIntegration = asyncHandler(async (req: Request, res: Response) => {
  const updates = req.body;
  if (updates.apiKey) delete updates.apiKey; // don't update via this endpoint directly
  const integration = await Integration.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true }).select('-apiKey');
  if (!integration) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Integration không tồn tại' } }); return; }
  res.json({ success: true, data: integration });
});

export const deleteIntegration = asyncHandler(async (req: Request, res: Response) => {
  const integration = await Integration.findByIdAndDelete(req.params.id);
  if (!integration) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Integration không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã xóa integration' });
});

// ─── Integration Logs ──────────────────────────────────────────────────────────
export const getIntegrationLogs = asyncHandler(async (req: Request, res: Response) => {
  const integrationId = req.query.integrationId as string;
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 50;
  const filter: Record<string, unknown> = {};
  if (integrationId) filter.integrationId = new Types.ObjectId(integrationId);
  if (req.query.status) filter.status = req.query.status;

  const [logs, total] = await Promise.all([
    IntegrationLog.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort({ timestamp: -1 }),
    IntegrationLog.countDocuments(filter),
  ]);

  res.json({ success: true, data: logs, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});
