import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  competencyQuerySchema,
  createCompetencySchema,
  updateCompetencySchema,
  competencyAssessmentQuerySchema,
  createCompetencyAssessmentSchema,
  idParamSchema,
} from '@/validators/shared.validator.js';
import {
  getDceStats,
  getCompetencyList,
  getCompetencyById,
  createCompetency,
  updateCompetency,
  deleteCompetency,
  getCompetencyAssessmentList,
  getCompetencyAssessmentById,
  createCompetencyAssessment,
  updateCompetencyAssessment,
  deleteCompetencyAssessment,
} from '@/controllers/dce.controller.js';

const router = Router();
router.use(authMiddleware);

// DCE Dashboard
router.get('/stats', getDceStats);

// Competencies
router.get('/competencies', validate(competencyQuerySchema, 'query'), getCompetencyList);
router.get('/competencies/:id', validate(idParamSchema, 'params'), getCompetencyById);
router.post('/competencies', validate(createCompetencySchema), createCompetency);
router.patch('/competencies/:id', validate(idParamSchema, 'params'), validate(updateCompetencySchema), updateCompetency);
router.delete('/competencies/:id', validate(idParamSchema, 'params'), deleteCompetency);

// Competency Assessments
router.get('/assessments', validate(competencyAssessmentQuerySchema, 'query'), getCompetencyAssessmentList);
router.get('/assessments/:id', validate(idParamSchema, 'params'), getCompetencyAssessmentById);
router.post('/assessments', validate(createCompetencyAssessmentSchema), createCompetencyAssessment);
router.patch('/assessments/:id', validate(idParamSchema, 'params'), validate(createCompetencyAssessmentSchema), updateCompetencyAssessment);
router.delete('/assessments/:id', validate(idParamSchema, 'params'), deleteCompetencyAssessment);

export default router;
