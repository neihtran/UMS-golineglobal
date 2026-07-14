import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } from './env.js';

// Global rate limiter for all routes
export const globalRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check and in development
    return req.path === '/health' || process.env.NODE_ENV === 'development';
  },
});

// Stricter rate limiter for auth routes
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_AUTH_ATTEMPTS',
      message: 'Quá nhiều lần đăng nhập, vui lòng thử lại sau 15 phút',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: () => {
    // Skip auth rate limiting in development
    return process.env.NODE_ENV === 'development';
  },
});
