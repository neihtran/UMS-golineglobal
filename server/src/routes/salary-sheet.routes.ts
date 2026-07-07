import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { validate } from '@/middleware/validate.middleware.js';
import { idParamSchema } from '@/validators/shared.validator.js';
import {
  getSalarySheets,
  getSalarySheetById,
  createSalarySheet,
  updateSalarySheet,
  deleteSalarySheet,
  getSalaryStats,
} from '@/controllers/salary-sheet.controller.js';
import {
  salarySheetQuerySchema,
  createSalarySheetSchema,
  updateSalarySheetSchema,
} from '@/validators/salary-sheet.validator.js';

const router = Router();
router.use(authMiddleware);

router.get('/', validate(salarySheetQuerySchema, 'query'), getSalarySheets);
router.get('/stats', getSalaryStats);
router.get('/:id', validate(idParamSchema, 'params'), getSalarySheetById);
router.post('/', validate(createSalarySheetSchema), createSalarySheet);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateSalarySheetSchema), updateSalarySheet);
router.delete('/:id', validate(idParamSchema, 'params'), deleteSalarySheet);

export default router;
