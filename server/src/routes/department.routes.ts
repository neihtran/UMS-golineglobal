import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import { Department } from '@/models/Department.js';
import { Types } from 'mongoose';
import { asyncHandler as ah } from '@/middleware/asyncHandler.js';
import {
  departmentQuerySchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  idParamSchema,
} from '@/validators/hrm.validator.js';

const router = Router();
router.use(authMiddleware);

// GET /api/departments
router.get(
  '/',
  validate(departmentQuerySchema, 'query'),
  ah(async (req, res) => {
    const q = req.query as any;
    const page = Number(q.page) || 1;
    const pageSize = Number(q.pageSize) || 50; // departments are small
    const filter: Record<string, unknown> = {};

    if (q.type) filter.type = q.type;
    if (q.isActive !== undefined) filter.isActive = q.isActive === 'true' || q.isActive === true;
    if (q.search) {
      filter.$or = [
        { name: { $regex: q.search, $options: 'i' } },
        { code: { $regex: q.search, $options: 'i' } },
      ];
    }

    const [departments, total] = await Promise.all([
      Department.find(filter)
        .populate('manager', 'displayName email')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ type: 1, code: 1 }),
      Department.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: departments,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  })
);

// GET /api/departments/:id
router.get('/:id', validate(idParamSchema, 'params'), ah(async (req, res) => {
  const dept = await Department.findById(req.params.id)
    .populate('manager', 'displayName email')
    .populate('parent', 'name code');
  if (!dept) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đơn vị không tồn tại' } });
    return;
  }
  res.json({ success: true, data: dept });
}));

// POST /api/departments
router.post(
  '/',
  validate(createDepartmentSchema),
  ah(async (req, res) => {
    const body = req.body;
    const existing = await Department.findOne({ code: body.code });
    if (existing) {
      res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Mã đơn vị đã tồn tại' } });
      return;
    }

    const dept = await Department.create({
      ...body,
      parent: body.parent ? new Types.ObjectId(body.parent) : undefined,
    });

    const saved = await Department.findById(dept._id).populate('manager', 'displayName email');
    res.status(201).json({ success: true, data: saved });
  })
);

// PATCH /api/departments/:id
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateDepartmentSchema), ah(async (req, res) => {
  const body = req.body as any;
  const updates: Record<string, unknown> = {};
  const allowed = ['name', 'shortName', 'type', 'parent', 'manager', 'phone', 'email', 'address', 'isActive'];
  for (const f of allowed) {
    if (f in body) {
      updates[f] = f === 'parent' ? (body[f] ? new Types.ObjectId(body[f]) : null) : body[f];
    }
  }

  const dept = await Department.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true })
    .populate('manager', 'displayName email');
  if (!dept) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đơn vị không tồn tại' } });
    return;
  }
  res.json({ success: true, data: dept });
}));

// DELETE /api/departments/:id
router.delete('/:id', validate(idParamSchema, 'params'), ah(async (req, res) => {
  const dept = await Department.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true });
  if (!dept) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đơn vị không tồn tại' } });
    return;
  }
  res.json({ success: true, message: 'Đã vô hiệu hóa đơn vị' });
}));

export default router;
