import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  ocrQuerySchema,
  createOcrJobSchema,
  idParamSchema,
} from '@/validators/dms.validator.js';
import {
  getOcrStats,
  getOcrJobList,
  getOcrJobById,
  createOcrJob,
  updateOcrJob,
  deleteOcrJob,
  cancelOcrJob,
} from '@/controllers/ocr.controller.js';

const router = Router();
router.use(authMiddleware);

// OCR Dashboard
router.get('/stats', getOcrStats);

// Jobs
router.get('/', validate(ocrQuerySchema, 'query'), getOcrJobList);
router.get('/:id', validate(idParamSchema, 'params'), getOcrJobById);
router.post('/', validate(createOcrJobSchema), createOcrJob);
router.patch('/:id', validate(idParamSchema, 'params'), validate(createOcrJobSchema), updateOcrJob);
router.post('/:id/cancel', validate(idParamSchema, 'params'), cancelOcrJob);
router.delete('/:id', validate(idParamSchema, 'params'), deleteOcrJob);

export default router;
