import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  documentQuerySchema,
  createDocumentSchema,
  updateDocumentSchema,
  idParamSchema,
} from '@/validators/dms.validator.js';
import {
  getDmsStats,
  getDocumentList,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  publishDocument,
  getCategories,
  getCategoryById,
  createCategory,
} from '@/controllers/dms.controller.js';

const router = Router();
router.use(authMiddleware);

// DMS Dashboard
router.get('/stats', getDmsStats);

// Documents
router.get('/', validate(documentQuerySchema, 'query'), getDocumentList);
router.get('/:id', validate(idParamSchema, 'params'), getDocumentById);
router.post('/', validate(createDocumentSchema), createDocument);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateDocumentSchema), updateDocument);
router.delete('/:id', validate(idParamSchema, 'params'), deleteDocument);
router.post('/:id/publish', validate(idParamSchema, 'params'), publishDocument);

// Categories
router.get('/categories', getCategories);
router.get('/categories/:id', validate(idParamSchema, 'params'), getCategoryById);
router.post('/categories', createCategory);

export default router;
