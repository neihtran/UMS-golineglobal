import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { requireRoles } from '@/middleware/role.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  vienChucQuerySchema,
  createVienChucSchema,
  updateVienChucSchema,
  idParamSchema,
} from '@/validators/hrm.validator.js';
import {
  getVienChucList,
  getVienChucById,
  createVienChuc,
  updateVienChuc,
  deleteVienChuc,
  getHrmStats,
  getHrmMonthlyTrend,
} from '@/controllers/hrm.controller.js';

const router = Router();

router.use(authMiddleware);

// ─── HRM Dashboard stats ────────────────────────────────────────────────────────
router.get('/stats', getHrmStats);
router.get('/stats/monthly-trend', getHrmMonthlyTrend);

// ─── VienChuc routes ────────────────────────────────────────────────────────────
router.get('/vien-chuc', validate(vienChucQuerySchema, 'query'), getVienChucList);
router.get('/vien-chuc/:id', validate(idParamSchema, 'params'), getVienChucById);
router.post('/vien-chuc', validate(createVienChucSchema), createVienChuc);
router.patch('/vien-chuc/:id', validate(idParamSchema, 'params'), validate(updateVienChucSchema), updateVienChuc);
router.delete('/vien-chuc/:id', validate(idParamSchema, 'params'), deleteVienChuc);

export default router;
