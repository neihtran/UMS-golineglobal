import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  subjectQuerySchema,
  createSubjectSchema,
  updateSubjectSchema,
  idParamSchema,
} from '@/validators/sis.validator.js';
import { Subject } from '@/models/Subject.js';
import { Types } from 'mongoose';

const router = Router();
router.use(authMiddleware);

router.get('/', validate(subjectQuerySchema, 'query'), asyncHandler(async (req, res) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};

  if (q.department) filter.department = new Types.ObjectId(q.department);
  if (q.credits) filter.credits = Number(q.credits);
  if (q.isActive !== undefined) filter.isActive = q.isActive;
  if (q.search) {
    filter.$or = [
      { name: { $regex: q.search, $options: 'i' } },
      { code: { $regex: q.search, $options: 'i' } },
    ];
  }

  const [subjects, total] = await Promise.all([
    Subject.find(filter)
      .populate('department', 'name code')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { code: 1 }),
    Subject.countDocuments(filter),
  ]);

  res.json({ success: true, data: subjects, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}));

router.get('/:id', validate(idParamSchema, 'params'), asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id).populate('department', 'name code');
  if (!subject) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Môn học không tồn tại' } }); return; }
  res.json({ success: true, data: subject });
}));

router.post('/', validate(createSubjectSchema), asyncHandler(async (req, res) => {
  const body = req.body as any;
  const existing = await Subject.findOne({ code: body.code });
  if (existing) { res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Mã môn học đã tồn tại' } }); return; }
  const subject = await Subject.create(body);
  const saved = await Subject.findById(subject._id).populate('department', 'name code');
  res.status(201).json({ success: true, data: saved });
}));

router.patch('/:id', validate(idParamSchema, 'params'), validate(updateSubjectSchema), asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true }).populate('department', 'name code');
  if (!subject) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Môn học không tồn tại' } }); return; }
  res.json({ success: true, data: subject });
}));

router.delete('/:id', validate(idParamSchema, 'params'), asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Môn học không tồn tại' } }); return; }
  res.json({ success: true, data: subject, message: 'Đã xóa môn học' });
}));

export default router;
