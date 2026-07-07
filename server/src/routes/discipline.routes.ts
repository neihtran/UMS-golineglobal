import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { validate } from '@/middleware/validate.middleware.js';
import { idParamSchema } from '@/validators/shared.validator.js';
import {
  getDisciplineList,
  getDisciplineById,
  createDiscipline,
  updateDiscipline,
  deleteDiscipline,
} from '@/controllers/discipline.controller.js';
import {
  disciplineQuerySchema,
  createDisciplineSchema,
  updateDisciplineSchema,
} from '@/validators/discipline.validator.js';

const router = Router();
router.use(authMiddleware);

router.get('/', validate(disciplineQuerySchema, 'query'), getDisciplineList);
router.get('/:id', validate(idParamSchema, 'params'), getDisciplineById);
router.post('/', validate(createDisciplineSchema), createDiscipline);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateDisciplineSchema), updateDiscipline);
router.delete('/:id', validate(idParamSchema, 'params'), deleteDiscipline);

export default router;
