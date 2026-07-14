import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// ─── Error Response Types ────────────────────────────────────────────────────

interface ValidationErrorDetail {
  field: string;
  message: string;
}

// ─── Global Error Handler ────────────────────────────────────────────────────

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Zod validation error
  if (err instanceof ZodError) {
    const errors: ValidationErrorDetail[] = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu không hợp lệ',
        details: errors,
      },
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
      },
    });
    return;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'ID không hợp lệ',
      },
    });
    return;
  }

  // MongoDB duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern || {})[0];
    res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ERROR',
        message: `Giá trị ${field || 'trường'} đã tồn tại`,
      },
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token không hợp lệ',
      },
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token đã hết hạn',
      },
    });
    return;
  }

  // Custom application errors
  if (err.name === 'AppError') {
    const statusCode = (err as any).statusCode || 400;
    res.status(statusCode).json({
      success: false,
      error: {
        code: (err as any).code || 'APP_ERROR',
        message: err.message,
      },
    });
    return;
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Lỗi server, vui lòng thử lại sau',
    },
  });
};

// ─── 404 Handler ──────────────────────────────────────────────────────────────

export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Không tìm thấy resource: ${req.method} ${req.path}`,
    },
  });
};

// ─── Custom Application Error ─────────────────────────────────────────────────

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number = 400, code: string = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
  }
}

// ─── Validation Middleware Factory ────────────────────────────────────────────

export const validate = (schema: any) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};
