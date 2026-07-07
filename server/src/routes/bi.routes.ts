import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  reportQuerySchema,
  createReportSchema,
  idParamSchema,
} from '@/validators/shared.validator.js';
import {
  getBiStats,
  getReportList,
  getReportById,
  createReport,
  updateReport,
  generateReport,
} from '@/controllers/bi.controller.js';

const router = Router();
router.use(authMiddleware);

// BI Dashboard
router.get('/stats', getBiStats);

// Reports
router.get('/reports', validate(reportQuerySchema, 'query'), getReportList);
router.get('/reports/:id', validate(idParamSchema, 'params'), getReportById);
router.post('/reports', validate(createReportSchema), createReport);
router.patch('/reports/:id', validate(idParamSchema, 'params'), validate(createReportSchema), updateReport);
router.post('/reports/:id/generate', validate(idParamSchema, 'params'), generateReport);

export default router;
