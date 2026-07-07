import { Request, Response } from 'express';
import { OCRJob } from '@/models/index.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';

// ─── OCR Stats ─────────────────────────────────────────────────────────────────
export const getOcrStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    total, queued, processing, completed, failed, cancelled,
    avgConfidence,
  ] = await Promise.all([
    OCRJob.countDocuments(),
    OCRJob.countDocuments({ status: 'queued' }),
    OCRJob.countDocuments({ status: 'processing' }),
    OCRJob.countDocuments({ status: 'completed' }),
    OCRJob.countDocuments({ status: 'failed' }),
    OCRJob.countDocuments({ status: 'cancelled' }),
    OCRJob.aggregate([
      { $match: { status: 'completed', confidence: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$confidence' } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      total,
      byStatus: { queued, processing, completed, failed, cancelled },
      avgConfidence: avgConfidence[0]?.avg ? Math.round(avgConfidence[0].avg) : null,
    },
  });
});

// ─── OCR Jobs CRUD ─────────────────────────────────────────────────────────────
export const getOcrJobList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};

  if (q.status) filter.status = q.status;
  if (q.category) filter.category = q.category;
  if (q.source) filter.source = q.source;
  if (q.fromDate || q.toDate) {
    filter.createdAt = {};
    if (q.fromDate) (filter.createdAt as any).$gte = new Date(q.fromDate);
    if (q.toDate) (filter.createdAt as any).$lte = new Date(q.toDate);
  }
  if (q.search) {
    filter.$or = [
      { fileName: { $regex: q.search, $options: 'i' } },
      { resultText: { $regex: q.search, $options: 'i' } },
    ];
  }

  const [jobs, total] = await Promise.all([
    OCRJob.find(filter)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    OCRJob.countDocuments(filter),
  ]);

  res.json({ success: true, data: jobs, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const getOcrJobById = asyncHandler(async (req: Request, res: Response) => {
  const job = await OCRJob.findById(req.params.id);
  if (!job) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Công việc OCR không tồn tại' } }); return; }
  res.json({ success: true, data: job });
});

export const createOcrJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await OCRJob.create(req.body);
  res.status(201).json({ success: true, data: job });
});

export const updateOcrJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await OCRJob.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!job) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Công việc OCR không tồn tại' } }); return; }
  res.json({ success: true, data: job });
});

export const deleteOcrJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await OCRJob.findByIdAndDelete(req.params.id);
  if (!job) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Công việc OCR không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã xóa công việc OCR' });
});

export const cancelOcrJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await OCRJob.findByIdAndUpdate(req.params.id, { $set: { status: 'cancelled' } }, { new: true });
  if (!job) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Công việc OCR không tồn tại' } }); return; }
  res.json({ success: true, data: job, message: 'Đã hủy công việc OCR' });
});
