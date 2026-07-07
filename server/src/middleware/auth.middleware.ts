import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@/models/User.js';
import { logger } from '@/utils/logger.js';
import { verifyAccessToken } from '@/utils/jwt.js';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Token không tồn tại' },
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Token không hợp lệ' },
      });
      return;
    }

    let decoded: JwtPayload;
    try {
      decoded = verifyAccessToken(token) as JwtPayload;
    } catch (err: unknown) {
      if (err instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token đã hết hạn, vui lòng đăng nhập lại.',
          },
        });
        return;
      }
      if (err instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Token không hợp lệ' },
        });
        return;
      }
      throw err;
    }

    const user = await User.findById(decoded.userId)
      .select('-password -refreshToken -__v')
      .populate('department', 'name code');

    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Tài khoản không tồn tại' },
      });
      return;
    }

    if (user.status === 'locked') {
      res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_LOCKED', message: 'Tài khoản đã bị khóa' },
      });
      return;
    }

    if (user.status === 'inactive') {
      res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_INACTIVE', message: 'Tài khoản đã bị vô hiệu hóa' },
      });
      return;
    }

    req.user = user as any;
    next();
  } catch (error) {
    logger.error('Auth middleware error', { error });
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Xác thực thất bại' },
    });
  }
}

// Optional: allow unauthenticated but attach user if token present
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  authMiddleware(req, res, next as NextFunction);
}
