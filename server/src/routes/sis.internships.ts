import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  internshipQuerySchema,
  createInternshipSchema,
  updateInternshipSchema,
  idParamSchema,
} from '@/validators/sis.validator.js';
import { Internship } from '@/models/Internship.js';

const router = Router();
router.use(authMiddleware);

router.get('/', validate(internshipQuerySchema, 'query'), asyncHandler(async (req, res) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 10;
  const filter: Record<string, unknown> = {};

  if (q.studentId) filter.studentId = q.studentId;
  if (q.status) filter.status = q.status;
  if (q.companyName) filter.companyName = { $regex: q.companyName, $options: 'i' };
  if (q.search) {
    filter.$or = [
      { studentName: { $regex: q.search, $options: 'i' } },
      { companyName: { $regex: q.search, $options: 'i' } },
    ];
  }

  const [list, total] = await Promise.all([
    Internship.find(filter)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { startDate: -1 }),
    Internship.countDocuments(filter),
  ]);

  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}));

router.get('/:id', validate(idParamSchema, 'params'), asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Thực tập không tồn tại' } }); return; }
  res.json({ success: true, data: internship });
}));

router.post('/', validate(createInternshipSchema), asyncHandler(async (req, res) => {
  const internship = await Internship.create(req.body);
  res.status(201).json({ success: true, data: internship });
}));

router.patch('/:id', validate(idParamSchema, 'params'), validate(updateInternshipSchema), asyncHandler(async (req, res) => {
  const internship = await Internship.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!internship) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Thực tập không tồn tại' } }); return; }
  res.json({ success: true, data: internship });
}));

router.delete('/:id', validate(idParamSchema, 'params'), asyncHandler(async (req, res) => {
  const internship = await Internship.findByIdAndDelete(req.params.id);
  if (!internship) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Thực tập không tồn tại' } }); return; }
  res.json({ success: true, data: internship, message: 'Đã xóa thực tập' });
}));

export default router;
