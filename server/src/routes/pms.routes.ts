import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  partyMemberQuerySchema,
  createPartyMemberSchema,
  updatePartyMemberSchema,
  activityQuerySchema,
  createActivitySchema,
  idParamSchema,
} from '@/validators/shared.validator.js';
import {
  getPmsStats,
  getPartyMemberList,
  getPartyMemberById,
  createPartyMember,
  updatePartyMember,
  deletePartyMember,
  getActivityList,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} from '@/controllers/pms.controller.js';

const router = Router();
router.use(authMiddleware);

// PMS Dashboard
router.get('/stats', getPmsStats);

// Party Members
router.get('/members', validate(partyMemberQuerySchema, 'query'), getPartyMemberList);
router.get('/members/:id', validate(idParamSchema, 'params'), getPartyMemberById);
router.post('/members', validate(createPartyMemberSchema), createPartyMember);
router.patch('/members/:id', validate(idParamSchema, 'params'), validate(updatePartyMemberSchema), updatePartyMember);
router.delete('/members/:id', validate(idParamSchema, 'params'), deletePartyMember);

// Activities
router.get('/activities', validate(activityQuerySchema, 'query'), getActivityList);
router.get('/activities/:id', validate(idParamSchema, 'params'), getActivityById);
router.post('/activities', validate(createActivitySchema), createActivity);
router.patch('/activities/:id', validate(idParamSchema, 'params'), validate(createActivitySchema), updateActivity);
router.delete('/activities/:id', validate(idParamSchema, 'params'), deleteActivity);

export default router;
