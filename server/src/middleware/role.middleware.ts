import { Request, Response, NextFunction } from 'express';
import { ROLE_HIERARCHY, Role } from '../models/User.js';

// Role hierarchy - higher number can access lower level roles
const ROLE_ACCESS: Record<string, Role[]> = {
  '/api/hrm': ['SUPER_ADMIN', 'ADMIN', 'NHAN_VIEN', 'CHUYEN_VIEN'],
  '/api/sis': ['SUPER_ADMIN', 'ADMIN', 'GIAO_VIEN', 'NHAN_VIEN'],
  '/api/dms': ['SUPER_ADMIN', 'ADMIN', 'NHAN_VIEN'],
  '/api/fin': ['SUPER_ADMIN', 'ADMIN', 'NHAN_VIEN'],
  '/api/lms': ['SUPER_ADMIN', 'ADMIN', 'GIAO_VIEN', 'SINH_VIEN'],
  '/api/exam': ['SUPER_ADMIN', 'ADMIN', 'GIAO_VIEN', 'SINH_VIEN'],
  '/api/portal': ['SUPER_ADMIN', 'ADMIN', 'GIAO_VIEN', 'SINH_VIEN', 'NHAN_VIEN'],
  '/api/wms': ['SUPER_ADMIN', 'ADMIN', 'GIAO_VIEN', 'NHAN_VIEN'],
  '/api/ktx': ['SUPER_ADMIN', 'ADMIN', 'NHAN_VIEN', 'GIAO_VIEN'],
  '/api/rit': ['SUPER_ADMIN', 'ADMIN', 'GIAO_VIEN'],
  '/api/bi': ['SUPER_ADMIN', 'ADMIN', 'NHAN_VIEN', 'HIEU_TRUONG', 'PHO_HIEU_TRUONG'],
  '/api/lib': ['SUPER_ADMIN', 'ADMIN', 'GIAO_VIEN', 'SINH_VIEN', 'NHAN_VIEN'],
  '/api/qa': ['SUPER_ADMIN', 'ADMIN', 'GIAO_VIEN', 'NHAN_VIEN'],
  '/api/dce': ['SUPER_ADMIN', 'ADMIN', 'GIAO_VIEN', 'SINH_VIEN'],
  '/api/iam': ['SUPER_ADMIN', 'ADMIN'],
  '/api/int': ['SUPER_ADMIN', 'ADMIN'],
  '/api/ocr': ['SUPER_ADMIN', 'ADMIN'],
  '/api/pms': ['SUPER_ADMIN', 'ADMIN'], // Isolated auth
};

// Role-based access control middleware
export const roleMiddleware = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Vui lòng đăng nhập',
        },
      });
      return;
    }

    const userRole = req.user.role as Role;
    const userRoleLevel = ROLE_HIERARCHY[userRole] || 0;

    // Check if user's role is in allowed list OR has higher privilege
    const hasAccess = allowedRoles.some((role) => {
      const allowedLevel = ROLE_HIERARCHY[role] || 0;
      return userRoleLevel >= allowedLevel;
    });

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Bạn không có quyền truy cập chức năng này',
        },
      });
      return;
    }

    next();
  };
};

// Module-level access control
export const moduleAccessMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Vui lòng đăng nhập',
      },
    });
    return;
  }

  // Find matching module prefix
  const path = req.path;
  const modulePath = Object.keys(ROLE_ACCESS).find((prefix) =>
    path.startsWith(prefix)
  );

  if (!modulePath) {
    // No specific access control for this path
    next();
    return;
  }

  const allowedRoles = ROLE_ACCESS[modulePath];
  const userRole = req.user.role as Role;
  const userRoleLevel = ROLE_HIERARCHY[userRole] || 0;

  const hasAccess = allowedRoles.some((role) => {
    const allowedLevel = ROLE_HIERARCHY[role] || 0;
    return userRoleLevel >= allowedLevel;
  });

  if (!hasAccess) {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Bạn không có quyền truy cập module này',
      },
    });
    return;
  }

  next();
};

// Permission check middleware
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Vui lòng đăng nhập',
        },
      });
      return;
    }

    const hasPermission =
      req.user.permissions.includes(permission) ||
      req.user.permissions.includes('*') ||
      req.user.role === 'SUPER_ADMIN' ||
      req.user.role === 'ADMIN';

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Bạn không có quyền thực hiện thao tác này',
        },
      });
      return;
    }

    next();
  };
};
