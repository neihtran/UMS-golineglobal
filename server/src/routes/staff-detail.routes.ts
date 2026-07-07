import Router from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import { idParamSchema } from '@/validators/shared.validator.js';
import { paginationSchema } from '@/validators/hrm.validator.js';
import {
  getContractHistory,
  getContractList,
  getSalaryHistory,
  getTraining,
  getStaffDiscipline,
  getStaffAppointments,
  getStaffAttachments,
} from '@/controllers/staff-detail.controller.js';

const router = Router();
router.use(authMiddleware);

router.get('/contracts', validate(paginationSchema, 'query'), asyncHandler(getContractList));
router.get('/:id/contracts', validate(idParamSchema, 'params'), validate(paginationSchema.optional(), 'query'), asyncHandler(getContractHistory));
router.get('/:id/salary', validate(idParamSchema, 'params'), asyncHandler(getSalaryHistory));
router.get('/:id/training', validate(idParamSchema, 'params'), asyncHandler(getTraining));
router.get('/:id/discipline', validate(idParamSchema, 'params'), asyncHandler(getStaffDiscipline));
router.get('/:id/appointments', validate(idParamSchema, 'params'), asyncHandler(getStaffAppointments));
router.get('/:id/attachments', validate(idParamSchema, 'params'), asyncHandler(getStaffAttachments));

export default router;
