import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  taskQuerySchema,
  createTaskSchema,
  updateTaskSchema,
  projectQuerySchema,
  createProjectSchema,
  updateProjectSchema,
  idParamSchema,
} from '@/validators/dms.validator.js';
import {
  getWmsStats,
  getTaskList,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getProjectList,
  getProjectById,
  createProject,
  updateProject,
} from '@/controllers/wms.controller.js';

const router = Router();
router.use(authMiddleware);

// WMS Dashboard
router.get('/stats', getWmsStats);

// Tasks
router.get('/tasks', validate(taskQuerySchema, 'query'), getTaskList);
router.get('/tasks/:id', validate(idParamSchema, 'params'), getTaskById);
router.post('/tasks', validate(createTaskSchema), createTask);
router.patch('/tasks/:id', validate(idParamSchema, 'params'), validate(updateTaskSchema), updateTask);
router.delete('/tasks/:id', validate(idParamSchema, 'params'), deleteTask);

// Projects
router.get('/projects', validate(projectQuerySchema, 'query'), getProjectList);
router.get('/projects/:id', validate(idParamSchema, 'params'), getProjectById);
router.post('/projects', validate(createProjectSchema), createProject);
router.patch('/projects/:id', validate(idParamSchema, 'params'), validate(updateProjectSchema), updateProject);

export default router;
