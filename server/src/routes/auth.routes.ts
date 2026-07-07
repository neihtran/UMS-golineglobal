import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  loginSchema,
  mfaVerifySchema,
  refreshTokenSchema,
} from '@/validators/auth.validator.js';
import {
  loginHandler,
  mfaVerifyHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
  setupMfaHandler,
  confirmMfaHandler,
  disableMfaHandler,
} from '@/controllers/auth.controller.js';

const router = Router();

// ─── Public routes ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { user, accessToken, refreshToken } or { mfaRequired, tempToken }
 */
router.post('/login', validate(loginSchema), loginHandler);

/**
 * POST /api/auth/mfa
 * Body: { tempToken, code }
 * Returns: { user, accessToken, refreshToken }
 */
router.post('/mfa', validate(mfaVerifySchema), mfaVerifyHandler);

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 * Returns: { accessToken }
 */
router.post('/refresh', validate(refreshTokenSchema), refreshHandler);

// ─── Protected routes ──────────────────────────────────────────────────────────

/**
 * GET /api/auth/me
 * Returns: current user profile
 */
router.get('/me', authMiddleware, meHandler);

/**
 * POST /api/auth/logout
 * Invalidates refresh token
 */
router.post('/logout', authMiddleware, logoutHandler);

/**
 * POST /api/auth/mfa/setup
 * Generate MFA secret and QR code
 */
router.post('/mfa/setup', authMiddleware, setupMfaHandler);

/**
 * POST /api/auth/mfa/confirm
 * Verify first MFA code and enable MFA
 */
router.post('/mfa/confirm', authMiddleware, confirmMfaHandler);

/**
 * DELETE /api/auth/mfa
 * Disable MFA for current user
 */
router.delete('/mfa', authMiddleware, disableMfaHandler);

export default router;
