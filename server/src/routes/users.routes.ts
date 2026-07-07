import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { requireRoles } from '@/middleware/role.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  userQuerySchema,
  createUserSchema,
  updateUserSchema,
  idParamSchema,
} from '@/validators/hrm.validator.js';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  lockUser,
  unlockUser,
  resetPassword,
} from '@/controllers/user.controller.js';

const router = Router();

// All routes require authentication + admin role
router.use(authMiddleware);
router.use(requireRoles('SUPER_ADMIN'));

// GET /api/users — list all users
router.get('/', validate(userQuerySchema, 'query'), getUsers);

// GET /api/users/:id
router.get('/:id', validate(idParamSchema, 'params'), getUserById);

// POST /api/users — create user
router.post('/', validate(createUserSchema), createUser);

// PATCH /api/users/:id
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateUserSchema), updateUser);

// DELETE /api/users/:id — soft delete (mark inactive)
router.delete('/:id', validate(idParamSchema, 'params'), deleteUser);

// POST /api/users/:id/lock — lock account
router.post('/:id/lock', validate(idParamSchema, 'params'), lockUser);

// POST /api/users/:id/unlock — unlock account
router.post('/:id/unlock', validate(idParamSchema, 'params'), unlockUser);

// POST /api/users/:id/reset-password — admin reset password
router.post('/:id/reset-password', validate(idParamSchema, 'params'), resetPassword);

export default router;
