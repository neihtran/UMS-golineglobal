import { Router } from 'express';
import { AuditLog } from '@/models/AuditLog.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { requireRoles } from '@/middleware/role.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { Types } from 'mongoose';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles('SUPER_ADMIN'));

// GET /api/audit-logs
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const filter: Record<string, unknown> = {};

    if (req.query.userId) filter.userId = new Types.ObjectId(req.query.userId as string);
    if (req.query.action) filter.action = req.query.action;
    if (req.query.resource) filter.resource = req.query.resource;
    if (req.query.status) filter.status = req.query.status;

    if (req.query.from || req.query.to) {
      filter.timestamp = {};
      if (req.query.from) (filter.timestamp as any).$gte = new Date(req.query.from as string);
      if (req.query.to) (filter.timestamp as any).$lte = new Date(req.query.to as string);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'displayName email role')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ timestamp: -1 }),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  })
);

export default router;
