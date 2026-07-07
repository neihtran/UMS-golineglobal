import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  researchProjectQuerySchema,
  createResearchProjectSchema,
  updateResearchProjectSchema,
  idParamSchema,
} from '@/validators/portal.validator.js';
import {
  getRitStats,
  getResearchProjectList,
  getResearchProjectById,
  createResearchProject,
  updateResearchProject,
  deleteResearchProject,
} from '@/controllers/rit.controller.js';

const router = Router();
router.use(authMiddleware);

// RIT Dashboard
router.get('/stats', getRitStats);

// Projects
router.get('/projects', validate(researchProjectQuerySchema, 'query'), getResearchProjectList);
router.get('/projects/:id', validate(idParamSchema, 'params'), getResearchProjectById);
router.post('/projects', validate(createResearchProjectSchema), createResearchProject);
router.patch('/projects/:id', validate(idParamSchema, 'params'), validate(updateResearchProjectSchema), updateResearchProject);
router.delete('/projects/:id', validate(idParamSchema, 'params'), deleteResearchProject);

export default router;
