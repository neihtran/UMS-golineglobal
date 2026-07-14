import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { env } from '../config/env.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// JWT Payload interface
interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token không hợp lệ',
        },
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

      // Find user and attach to request
      const user = await User.findById(decoded.userId)
        .select('-password -mfaSecret')
        .populate('department', 'name code');

      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Tài khoản không tồn tại',
          },
        });
        return;
      }

      // Check if user is locked
      if (user.status === 'locked') {
        res.status(401).json({
          success: false,
          error: {
            code: 'ACCOUNT_LOCKED',
            message: 'Tài khoản đã bị khóa',
          },
        });
        return;
      }

      if (user.status === 'inactive') {
        res.status(401).json({
          success: false,
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Tài khoản đã bị vô hiệu hóa',
          },
        });
        return;
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token đã hết hạn, vui lòng đăng nhập lại',
          },
        });
        return;
      }

      if (jwtError instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token không hợp lệ',
          },
        });
        return;
      }

      throw jwtError;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Lỗi xác thực',
      },
    });
  }
};

// Optional auth - doesn't fail if no token, just doesn't attach user
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
      const user = await User.findById(decoded.userId).select('-password -mfaSecret');
      
      if (user && user.status === 'active') {
        req.user = user;
      }
    } catch {
      // Token invalid/expired, continue without user
    }

    next();
  } catch (error) {
    next();
  }
};
