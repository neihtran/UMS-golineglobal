import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authRateLimiter } from '../config/rateLimit.js';
import { validate } from '../middleware/error.middleware.js';
import { loginSchema, refreshTokenSchema, mfaVerifySchema } from '../validators/auth.validator.js';

const router = Router();

// Public routes (with rate limiting)
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/mfa', authRateLimiter, validate(mfaVerifySchema), authController.verifyMfa);
router.post('/refresh', authRateLimiter, validate(refreshTokenSchema), authController.refreshToken);

// Protected routes - handled in routes/index.ts with auth middleware

export default router;
