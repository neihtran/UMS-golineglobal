import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  enrollmentQuerySchema,
  createEnrollmentSchema,
  updateEnrollmentSchema,
  idParamSchema,
} from '@/validators/sis.validator.js';
import { Enrollment } from '@/models/Enrollment.js';

const router = Router();
router.use(authMiddleware);

router.get('/', validate(enrollmentQuerySchema, 'query'), asyncHandler(async (req, res) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 10;
  const filter: Record<string, unknown> = {};

  if (q.studentId) filter.studentId = q.studentId;
  if (q.subjectId) filter.subjectId = q.subjectId;
  if (q.semester) filter.semester = q.semester;
  if (q.academicYear) filter.academicYear = q.academicYear;
  if (q.classGroup) filter.classGroup = q.classGroup;
  if (q.status) filter.status = q.status;

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    Enrollment.countDocuments(filter),
  ]);

  res.json({ success: true, data: enrollments, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}));

router.get('/:id', validate(idParamSchema, 'params'), asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đăng ký học không tồn tại' } }); return; }
  res.json({ success: true, data: enrollment });
}));

router.post('/', validate(createEnrollmentSchema), asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.create(req.body);
  res.status(201).json({ success: true, data: enrollment });
}));

router.patch('/:id', validate(idParamSchema, 'params'), validate(updateEnrollmentSchema), asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!enrollment) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đăng ký học không tồn tại' } }); return; }
  res.json({ success: true, data: enrollment });
}));

router.delete('/:id', validate(idParamSchema, 'params'), asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
  if (!enrollment) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đăng ký học không tồn tại' } }); return; }
  res.json({ success: true, data: enrollment, message: 'Đã xóa đăng ký học' });
}));

export default router;
