import { Request, Response } from 'express';
import { Competency, CompetencyAssessment } from '@/models/index.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';

// ─── DCE Stats ─────────────────────────────────────────────────────────────────
export const getDceStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    totalCompetencies, activeCompetencies,
    totalAssessments, avgScore,
    assessmentsByLevel,
  ] = await Promise.all([
    Competency.countDocuments(),
    Competency.countDocuments({ isActive: true }),
    CompetencyAssessment.countDocuments(),
    CompetencyAssessment.aggregate([{ $group: { _id: null, avg: { $avg: '$score' } } }]),
    CompetencyAssessment.aggregate([
      { $group: { _id: '$assessedLevel', count: { $sum: 1 } } },
      { $project: { level: '$_id', count: 1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      competencies: { total: totalCompetencies, active: activeCompetencies },
      assessments: { total: totalAssessments, avgScore: avgScore[0]?.avg ? Number(avgScore[0].avg.toFixed(1)) : 0 },
      byLevel: assessmentsByLevel,
    },
  });
});

// ─── Competency CRUD ───────────────────────────────────────────────────────────
export const getCompetencyList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};
  if (q.category) filter.category = q.category;
  if (q.level) filter['levels.level'] = q.level;
  if (q.isActive !== undefined) filter.isActive = q.isActive;
  if (q.search) filter.name = { $regex: q.search, $options: 'i' };

  const [list, total] = await Promise.all([
    Competency.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { name: 1 }),
    Competency.countDocuments(filter),
  ]);

  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const getCompetencyById = asyncHandler(async (req: Request, res: Response) => {
  const competency = await Competency.findById(req.params.id);
  if (!competency) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Năng lực không tồn tại' } }); return; }
  res.json({ success: true, data: competency });
});

export const createCompetency = asyncHandler(async (req: Request, res: Response) => {
  const competency = await Competency.create(req.body);
  res.status(201).json({ success: true, data: competency });
});

export const updateCompetency = asyncHandler(async (req: Request, res: Response) => {
  const competency = await Competency.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!competency) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Năng lực không tồn tại' } }); return; }
  res.json({ success: true, data: competency });
});

// ─── Competency Assessments ────────────────────────────────────────────────────
export const getCompetencyAssessmentList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};
  if (q.personId) filter.personId = q.personId;
  if (q.competencyId) filter.competencyId = q.competencyId;
  if (q.minScore !== undefined) filter.score = { ...(filter.score as any), $gte: Number(q.minScore) };
  if (q.maxScore !== undefined) filter.score = { ...(filter.score as any), $lte: Number(q.maxScore) };

  const [list, total] = await Promise.all([
    CompetencyAssessment.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { assessedAt: -1 }),
    CompetencyAssessment.countDocuments(filter),
  ]);

  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const createCompetencyAssessment = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  if (body.assessedAt) body.assessedAt = new Date(body.assessedAt);
  const assessment = await CompetencyAssessment.create(body);
  res.status(201).json({ success: true, data: assessment });
});

export const getCompetencyAssessmentById = asyncHandler(async (req: Request, res: Response) => {
  const assessment = await CompetencyAssessment.findById(req.params.id);
  if (!assessment) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đánh giá năng lực không tồn tại' } }); return; }
  res.json({ success: true, data: assessment });
});

export const updateCompetencyAssessment = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  if (body.assessedAt) body.assessedAt = new Date(body.assessedAt);
  const assessment = await CompetencyAssessment.findByIdAndUpdate(req.params.id, { $set: body }, { new: true, runValidators: true });
  if (!assessment) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đánh giá năng lực không tồn tại' } }); return; }
  res.json({ success: true, data: assessment });
});

export const deleteCompetency = asyncHandler(async (req: Request, res: Response) => {
  const competency = await Competency.findByIdAndDelete(req.params.id);
  if (!competency) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Năng lực không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã xóa năng lực' });
});

export const deleteCompetencyAssessment = asyncHandler(async (req: Request, res: Response) => {
  const assessment = await CompetencyAssessment.findByIdAndDelete(req.params.id);
  if (!assessment) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đánh giá năng lực không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã xóa đánh giá năng lực' });
});
