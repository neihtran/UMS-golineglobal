import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  graduationQuerySchema,
  idParamSchema,
} from '@/validators/sis.validator.js';
import { GraduationSession, GraduationRecord } from '@/models/Graduation.js';
import { Types } from 'mongoose';

const router = Router();
router.use(authMiddleware);

// ─── Sessions ───────────────────────────────────────────────────────────────

router.get('/sessions', validate(graduationQuerySchema, 'query'), asyncHandler(async (req, res) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};
  if (q.academicYear) filter.academicYear = q.academicYear;
  if (q.sessionStatus) filter.status = q.sessionStatus;

  const [list, total] = await Promise.all([
    GraduationSession.find(filter)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { graduationDate: -1 }),
    GraduationSession.countDocuments(filter),
  ]);
  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}));

router.get('/sessions/:id', validate(idParamSchema, 'params'), asyncHandler(async (req, res) => {
  const session = await GraduationSession.findById(req.params.id);
  if (!session) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đợt tốt nghiệp không tồn tại' } }); return; }
  res.json({ success: true, data: session });
}));

router.post('/sessions/open', asyncHandler(async (req, res) => {
  const session = await GraduationSession.create({ ...req.body, status: 'open' });
  res.status(201).json({ success: true, data: session });
}));

router.patch('/sessions/:id', validate(idParamSchema, 'params'), asyncHandler(async (req, res) => {
  const session = await GraduationSession.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!session) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đợt tốt nghiệp không tồn tại' } }); return; }
  res.json({ success: true, data: session });
}));

router.post('/sessions/:id/close', validate(idParamSchema, 'params'), asyncHandler(async (req, res) => {
  const session = await GraduationSession.findByIdAndUpdate(req.params.id, { status: 'closed', closeDate: new Date() }, { new: true });
  if (!session) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đợt tốt nghiệp không tồn tại' } }); return; }
  res.json({ success: true, data: session });
}));

router.delete('/sessions/:id', validate(idParamSchema, 'params'), asyncHandler(async (req, res) => {
  const session = await GraduationSession.findByIdAndDelete(req.params.id);
  if (!session) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đợt tốt nghiệp không tồn tại' } }); return; }
  await GraduationRecord.deleteMany({ graduationSessionId: req.params.id });
  res.json({ success: true, data: session, message: 'Đã xóa đợt tốt nghiệp và các bản ghi liên quan' });
}));

// ─── Records ─────────────────────────────────────────────────────────────────

router.get('/records', asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;
  const graduationSessionId = req.query.graduationSessionId as string;
  const filter: Record<string, unknown> = {};
  if (graduationSessionId) filter.graduationSessionId = new Types.ObjectId(graduationSessionId);

  const [records, total] = await Promise.all([
    GraduationRecord.find(filter)
      .populate('graduationSessionId', 'name academicYear semester')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ graduationDate: -1 }),
    GraduationRecord.countDocuments(filter),
  ]);
  res.json({ success: true, data: records, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}));

router.get('/records/:id', validate(idParamSchema, 'params'), asyncHandler(async (req, res) => {
  const record = await GraduationRecord.findById(req.params.id).populate('graduationSessionId', 'name academicYear semester');
  if (!record) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Bản ghi tốt nghiệp không tồn tại' } }); return; }
  res.json({ success: true, data: record });
}));

router.post('/records', asyncHandler(async (req, res) => {
  const record = await GraduationRecord.create(req.body);
  res.status(201).json({ success: true, data: record });
}));

router.patch('/records/:id', validate(idParamSchema, 'params'), asyncHandler(async (req, res) => {
  const record = await GraduationRecord.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!record) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Bản ghi tốt nghiệp không tồn tại' } }); return; }
  res.json({ success: true, data: record });
}));

router.delete('/records/:id', validate(idParamSchema, 'params'), asyncHandler(async (req, res) => {
  const record = await GraduationRecord.findByIdAndDelete(req.params.id);
  if (!record) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Bản ghi tốt nghiệp không tồn tại' } }); return; }
  res.json({ success: true, data: record, message: 'Đã xóa bản ghi tốt nghiệp' });
}));

export default router;
