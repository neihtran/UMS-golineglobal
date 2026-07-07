import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { validate } from '@/middleware/validate.middleware.js';
import { idParamSchema } from '@/validators/hrm.validator.js';
import {
  integrationQuerySchema,
  createIntegrationSchema,
  updateIntegrationSchema,
  integrationLogQuerySchema,
} from '@/validators/int.validator.js';
import {
  getIntStats,
  getIntegrationList,
  getIntegrationById,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  getIntegrationLogs,
} from '@/controllers/int.controller.js';

const router = Router();
router.use(authMiddleware);

// INT Dashboard
router.get('/stats', getIntStats);

// Integrations CRUD
router.get('/', validate(integrationQuerySchema, 'query'), getIntegrationList);
router.get('/:id', validate(idParamSchema, 'params'), getIntegrationById);
router.post('/', validate(createIntegrationSchema), createIntegration);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateIntegrationSchema), updateIntegration);
router.delete('/:id', validate(idParamSchema, 'params'), deleteIntegration);

// Integration Logs
router.get('/logs', validate(integrationLogQuerySchema, 'query'), getIntegrationLogs);

export default router;
