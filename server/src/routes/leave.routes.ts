import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  leaveQuerySchema,
  createLeaveSchema,
  updateLeaveSchema,
  idParamSchema,
} from '@/validators/hrm.validator.js';
import {
  getLeaveList,
  getLeaveById,
  createLeave,
  updateLeave,
  approveLeave,
  rejectLeave,
  deleteLeave,
  getLeaveStats,
  getLeaveBalance,
} from '@/controllers/leave.controller.js';

const router = Router();

router.use(authMiddleware);

// Leave stats
router.get('/stats', getLeaveStats);
router.get('/balance/:employeeId', getLeaveBalance);

// CRUD
router.get('/', validate(leaveQuerySchema, 'query'), getLeaveList);
router.get('/:id', validate(idParamSchema, 'params'), getLeaveById);
router.post('/', validate(createLeaveSchema), createLeave);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateLeaveSchema), updateLeave);

// Actions
router.post('/:id/approve', validate(idParamSchema, 'params'), approveLeave);
router.post('/:id/reject', validate(idParamSchema, 'params'), rejectLeave);
router.delete('/:id', validate(idParamSchema, 'params'), deleteLeave);

export default router;
