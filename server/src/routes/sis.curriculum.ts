import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  curriculumQuerySchema,
  createCurriculumSchema,
  updateCurriculumSchema,
  idParamSchema,
} from '@/validators/sis.validator.js';
import { Curriculum } from '@/models/Curriculum.js';

const router = Router();
router.use(authMiddleware);

router.get('/', validate(curriculumQuerySchema, 'query'), asyncHandler(async (req, res) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};

  if (q.educationLevel) filter.educationLevel = q.educationLevel;
  if (q.status) filter.status = q.status;

  const [list, total] = await Promise.all([
    Curriculum.find(filter).populate('department', 'name code')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { startYear: -1 }),
    Curriculum.countDocuments(filter),
  ]);

  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}));

router.get('/:id', validate(idParamSchema, 'params'), asyncHandler(async (req, res) => {
  const curriculum = await Curriculum.findById(req.params.id).populate('department', 'name code');
  if (!curriculum) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Chương trình không tồn tại' } }); return; }
  res.json({ success: true, data: curriculum });
}));

router.post('/', validate(createCurriculumSchema), asyncHandler(async (req, res) => {
  const curriculum = await Curriculum.create(req.body);
  const saved = await Curriculum.findById(curriculum._id).populate('department', 'name code');
  res.status(201).json({ success: true, data: saved });
}));

router.patch('/:id', validate(idParamSchema, 'params'), validate(updateCurriculumSchema), asyncHandler(async (req, res) => {
  const curriculum = await Curriculum.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true }).populate('department', 'name code');
  if (!curriculum) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Chương trình không tồn tại' } }); return; }
  res.json({ success: true, data: curriculum });
}));

router.delete('/:id', validate(idParamSchema, 'params'), asyncHandler(async (req, res) => {
  const curriculum = await Curriculum.findByIdAndDelete(req.params.id);
  if (!curriculum) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Chương trình không tồn tại' } }); return; }
  res.json({ success: true, data: curriculum, message: 'Đã xóa chương trình' });
}));

export default router;
