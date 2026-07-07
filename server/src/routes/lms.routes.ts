import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  courseQuerySchema,
  createCourseSchema,
  updateCourseSchema,
  assignmentQuerySchema,
  createAssignmentSchema,
  updateAssignmentSchema,
  idParamSchema,
} from '@/validators/lms.validator.js';
import {
  getLmsStats,
  getCourseList,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getAssignmentList,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '@/controllers/lms.controller.js';

const router = Router();
router.use(authMiddleware);

// LMS Dashboard
router.get('/stats', getLmsStats);

// Courses
router.get('/courses', validate(courseQuerySchema, 'query'), getCourseList);
router.get('/courses/:id', validate(idParamSchema, 'params'), getCourseById);
router.post('/courses', validate(createCourseSchema), createCourse);
router.patch('/courses/:id', validate(idParamSchema, 'params'), validate(updateCourseSchema), updateCourse);
router.delete('/courses/:id', validate(idParamSchema, 'params'), deleteCourse);

// Assignments
router.get('/assignments', validate(assignmentQuerySchema, 'query'), getAssignmentList);
router.get('/assignments/:id', validate(idParamSchema, 'params'), getAssignmentById);
router.post('/assignments', validate(createAssignmentSchema), createAssignment);
router.patch('/assignments/:id', validate(idParamSchema, 'params'), validate(updateAssignmentSchema), updateAssignment);
router.delete('/assignments/:id', validate(idParamSchema, 'params'), deleteAssignment);

export default router;
