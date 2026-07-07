import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  tuitionQuerySchema,
  createTuitionSchema,
  expenditureQuerySchema,
  createExpenditureSchema,
  idParamSchema,
} from '@/validators/portal.validator.js';
import {
  getFinStats,
  getTuitionList,
  getTuitionById,
  createTuition,
  updateTuition,
  deleteTuition,
  getExpenditureList,
  getExpenditureById,
  createExpenditure,
  updateExpenditure,
  approveExpenditure,
  deleteExpenditure,
} from '@/controllers/fin.controller.js';

const router = Router();
router.use(authMiddleware);

// FIN Dashboard
router.get('/stats', getFinStats);

// Tuition
router.get('/tuition', validate(tuitionQuerySchema, 'query'), getTuitionList);
router.get('/tuition/:id', validate(idParamSchema, 'params'), getTuitionById);
router.post('/tuition', validate(createTuitionSchema), createTuition);
router.patch('/tuition/:id', validate(idParamSchema, 'params'), validate(createTuitionSchema), updateTuition);
router.delete('/tuition/:id', validate(idParamSchema, 'params'), deleteTuition);

// Expenditure
router.get('/expenditure', validate(expenditureQuerySchema, 'query'), getExpenditureList);
router.get('/expenditure/:id', validate(idParamSchema, 'params'), getExpenditureById);
router.post('/expenditure', validate(createExpenditureSchema), createExpenditure);
router.patch('/expenditure/:id', validate(idParamSchema, 'params'), validate(createExpenditureSchema), updateExpenditure);
router.post('/expenditure/:id/approve', validate(idParamSchema, 'params'), approveExpenditure);
router.delete('/expenditure/:id', validate(idParamSchema, 'params'), deleteExpenditure);

export default router;
