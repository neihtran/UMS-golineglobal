import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '@/utils/logger.js';

/**
 * Validate request body, query, or params against a Zod schema.
 */
export function validate<T>(
  schema: ZodSchema<T>,
  target: 'body' | 'query' | 'params' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = target === 'body' ? req.body : target === 'query' ? req.query : req.params;

    const result = schema.safeParse(data);

    if (!result.success) {
      const error = result.error as ZodError;
      const details = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      logger.warn('Validation failed', { path: req.path, errors: details });

      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dữ liệu không hợp lệ',
          details,
        },
      });
      return;
    }

    // Replace with parsed (and coerced) data
    if (target === 'body') req.body = result.data;
    else if (target === 'query') (req as any).validatedQuery = result.data;
    else if (target === 'params') (req as any).validatedParams = result.data;

    next();
  };
}
