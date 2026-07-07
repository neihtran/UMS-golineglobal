import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger.js';

/**
 * Global error handler — must be last in middleware chain.
 * Catches all thrown errors and returns standardized error response.
 */
export function errorHandler(
  err: Error & { statusCode?: number; code?: string; details?: unknown },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  // Log full error (never log sensitive data)
  if (statusCode >= 500) {
    logger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      code,
      statusCode,
    });
  } else {
    logger.warn('Client error', { error: err.message, code, statusCode });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message:
        statusCode >= 500
          ? 'Đã xảy ra lỗi phía máy chủ, vui lòng thử lại sau.'
          : err.message,
      ...(process.env.NODE_ENV === 'development' && { details: err.details || err.stack }),
    },
  });
}
