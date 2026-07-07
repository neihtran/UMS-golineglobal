import { Request, Response } from 'express';
import { Evidence, Assessment } from '@/models/index.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';

// ─── QA Stats ──────────────────────────────────────────────────────────────────
export const getQaStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    total, draft, submitted, reviewing, approved, rejected, archived,
    totalAssessments, activeAssessments,
  ] = await Promise.all([
    Evidence.countDocuments(),
    Evidence.countDocuments({ status: 'draft' }),
    Evidence.countDocuments({ status: 'submitted' }),
    Evidence.countDocuments({ status: 'reviewing' }),
    Evidence.countDocuments({ status: 'approved' }),
    Evidence.countDocuments({ status: 'rejected' }),
    Evidence.countDocuments({ status: 'archived' }),
    Assessment.countDocuments(),
    Assessment.countDocuments({ status: 'active' }),
  ]);

  res.json({
    success: true,
    data: {
      evidence: { total, byStatus: { draft, submitted, reviewing, approved, rejected, archived } },
      assessments: { total: totalAssessments, active: activeAssessments },
    },
  });
});

// ─── Evidence CRUD ─────────────────────────────────────────────────────────────
export const getEvidenceList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};
  if (q.standardCode) filter.standardCode = q.standardCode;
  if (q.status) filter.status = q.status;
  if (q.submittedBy) filter.submittedBy = q.submittedBy;
  if (q.reviewedBy) filter.reviewedBy = q.reviewedBy;
  if (q.search) filter.title = { $regex: q.search, $options: 'i' };

  const [list, total] = await Promise.all([
    Evidence.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    Evidence.countDocuments(filter),
  ]);

  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const getEvidenceById = asyncHandler(async (req: Request, res: Response) => {
  const evidence = await Evidence.findById(req.params.id);
  if (!evidence) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Minh chứng không tồn tại' } }); return; }
  res.json({ success: true, data: evidence });
});

export const createEvidence = asyncHandler(async (req: Request, res: Response) => {
  const evidence = await Evidence.create({ ...req.body, submittedBy: req.user?.displayName });
  res.status(201).json({ success: true, data: evidence });
});

export const updateEvidence = asyncHandler(async (req: Request, res: Response) => {
  const evidence = await Evidence.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!evidence) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Minh chứng không tồn tại' } }); return; }
  res.json({ success: true, data: evidence });
});

// ─── Assessment CRUD ───────────────────────────────────────────────────────────
export const getAssessmentList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};
  if (q.type) filter.type = q.type;
  if (q.standardCode) filter.standardCode = q.standardCode;
  if (q.status) filter.status = q.status;
  if (q.targetDepartment) filter.targetDepartment = q.targetDepartment;

  const [list, total] = await Promise.all([
    Assessment.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { startDate: -1 }),
    Assessment.countDocuments(filter),
  ]);

  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const createAssessment = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  if (body.startDate) body.startDate = new Date(body.startDate);
  if (body.endDate) body.endDate = new Date(body.endDate);
  const assessment = await Assessment.create(body);
  res.status(201).json({ success: true, data: assessment });
});

export const getAssessmentById = asyncHandler(async (req: Request, res: Response) => {
  const assessment = await Assessment.findById(req.params.id);
  if (!assessment) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đánh giá không tồn tại' } }); return; }
  res.json({ success: true, data: assessment });
});

export const updateAssessment = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  if (body.startDate) body.startDate = new Date(body.startDate);
  if (body.endDate) body.endDate = new Date(body.endDate);
  const assessment = await Assessment.findByIdAndUpdate(req.params.id, { $set: body }, { new: true, runValidators: true });
  if (!assessment) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đánh giá không tồn tại' } }); return; }
  res.json({ success: true, data: assessment });
});

export const deleteAssessment = asyncHandler(async (req: Request, res: Response) => {
  const assessment = await Assessment.findByIdAndDelete(req.params.id);
  if (!assessment) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đánh giá không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã xóa đánh giá' });
});

export const deleteEvidence = asyncHandler(async (req: Request, res: Response) => {
  const evidence = await Evidence.findByIdAndDelete(req.params.id);
  if (!evidence) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Minh chứng không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã xóa minh chứng' });
});
