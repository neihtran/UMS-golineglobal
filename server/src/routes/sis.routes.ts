import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  studentQuerySchema,
  createStudentSchema,
  updateStudentSchema,
} from '@/validators/sis.validator.js';
import { idParamSchema } from '@/validators/shared.validator.js';
import {
  getStudentList,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getSisStats,
} from '@/controllers/sis.controller.js';

const router = Router();
router.use(authMiddleware);

// SIS Dashboard stats
router.get('/stats', getSisStats);

// ─── Students ──────────────────────────────────────────────────────────────────
router.get('/students', validate(studentQuerySchema, 'query'), getStudentList);
router.get('/students/:id', validate(idParamSchema, 'params'), getStudentById);
router.post('/students', validate(createStudentSchema), createStudent);
router.patch('/students/:id', validate(idParamSchema, 'params'), validate(updateStudentSchema), updateStudent);
router.delete('/students/:id', validate(idParamSchema, 'params'), deleteStudent);

export default router;
