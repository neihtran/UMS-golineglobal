import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  getRecruitmentList,
  getRecruitmentById,
  createRecruitment,
  updateRecruitment,
  deleteRecruitment,
  getRecruitmentStats,
} from '@/controllers/recruitment.controller.js';
import {
  recruitmentQuerySchema,
  createRecruitmentSchema,
  updateRecruitmentSchema,
  idParamSchema,
} from '@/validators/recruitment.validator.js';

const router = Router();
router.use(authMiddleware);

router.get('/', validate(recruitmentQuerySchema, 'query'), getRecruitmentList);
router.get('/stats', getRecruitmentStats);
router.get('/:id', validate(idParamSchema, 'params'), getRecruitmentById);
router.post('/', validate(createRecruitmentSchema), createRecruitment);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateRecruitmentSchema), updateRecruitment);
router.delete('/:id', validate(idParamSchema, 'params'), deleteRecruitment);

export default router;
