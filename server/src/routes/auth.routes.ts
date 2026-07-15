// @ts-nocheck
import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';

const router = Router();

// POST /api/auth/login
router.post('/login', validateRequest(loginSchema), asyncHandler(authController.login));

// POST /api/auth/register
router.post('/register', validateRequest(registerSchema), asyncHandler(authController.register));

// POST /api/auth/refresh
router.post('/refresh', asyncHandler(authController.refreshToken));

// POST /api/auth/mfa/verify
router.post('/mfa/verify', asyncHandler(authController.verifyMfa));

// POST /api/auth/logout
router.post('/logout', asyncHandler(authController.logout));

// GET /api/auth/me
router.get('/me', asyncHandler(authController.getCurrentUser));

// POST /api/auth/mfa/setup
router.post('/mfa/setup', asyncHandler(authController.setupMfa));

// POST /api/auth/mfa/enable
router.post('/mfa/enable', asyncHandler(authController.enableMfa));

export default router;
