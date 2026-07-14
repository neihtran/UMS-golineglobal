import { Router } from 'express';
import { iamController } from '../controllers/iam.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { auditMiddleware } from '../middleware/audit.middleware.js';
import { validate } from '../middleware/error.middleware.js';
import {
  createUserSchema, updateUserSchema,
  createRoleSchema, updateRoleSchema,
  createTenantSchema, updateTenantSchema,
} from '../validators/iam.validator.js';
import { z } from 'zod';

const router = Router();

router.use(authMiddleware);

// ─── Users ──────────────────────────────────────────────────────────────────

router.get('/users', iamController.listUsers);

router.get('/users/stats', iamController.getUserStats);

router.get('/users/:id', iamController.getUserById);

router.post(
  '/users',
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  auditMiddleware('User'),
  validate(createUserSchema),
  iamController.createUser,
);

router.patch(
  '/users/:id',
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  auditMiddleware('User'),
  validate(updateUserSchema),
  iamController.updateUser,
);

router.delete(
  '/users/:id',
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  auditMiddleware('User'),
  iamController.deleteUser,
);

router.post(
  '/users/:id/lock',
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  auditMiddleware('User'),
  validate(z.object({ reason: z.string().optional() })),
  iamController.lockUser,
);

router.post(
  '/users/:id/unlock',
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  auditMiddleware('User'),
  iamController.unlockUser,
);

router.post(
  '/users/:id/reset-password',
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  auditMiddleware('User'),
  validate(z.object({ newPassword: z.string().min(6) })),
  iamController.resetPassword,
);

// ─── Roles ──────────────────────────────────────────────────────────────────

router.get('/roles', iamController.listRoles);

router.get('/roles/:id', iamController.getRoleById);

router.post(
  '/roles',
  roleMiddleware(['SUPER_ADMIN']),
  auditMiddleware('Role'),
  validate(createRoleSchema),
  iamController.createRole,
);

router.patch(
  '/roles/:id',
  roleMiddleware(['SUPER_ADMIN']),
  auditMiddleware('Role'),
  validate(updateRoleSchema),
  iamController.updateRole,
);

router.delete(
  '/roles/:id',
  roleMiddleware(['SUPER_ADMIN']),
  auditMiddleware('Role'),
  iamController.deleteRole,
);

// ─── Tenants ────────────────────────────────────────────────────────────────

router.get('/tenants', iamController.listTenants);

router.get('/tenants/:id', iamController.getTenantById);

router.post(
  '/tenants',
  roleMiddleware(['SUPER_ADMIN']),
  auditMiddleware('Tenant'),
  validate(createTenantSchema),
  iamController.createTenant,
);

router.patch(
  '/tenants/:id',
  roleMiddleware(['SUPER_ADMIN']),
  auditMiddleware('Tenant'),
  validate(updateTenantSchema),
  iamController.updateTenant,
);

router.delete(
  '/tenants/:id',
  roleMiddleware(['SUPER_ADMIN']),
  auditMiddleware('Tenant'),
  iamController.deleteTenant,
);

// ─── Audit Logs ─────────────────────────────────────────────────────────────

router.get('/audit-logs', iamController.listAuditLogs);

router.get('/audit-logs/stats', iamController.getAuditLogStats);

// ─── Sessions ───────────────────────────────────────────────────────────────

router.get('/sessions', iamController.listSessions);

router.post('/sessions/:id/revoke', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), auditMiddleware('Session'), iamController.revokeSession);

router.post('/sessions/user/:userId/revoke-all', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), auditMiddleware('Session'), iamController.revokeAllUserSessions);

export default router;