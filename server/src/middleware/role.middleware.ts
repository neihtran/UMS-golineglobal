import { Request, Response, NextFunction } from 'express';
import { ROLE_HIERARCHY, MFA_REQUIRED_ROLES } from '@/constants/roles.js';
import { logger } from '@/utils/logger.js';

// Re-export so other modules can import from this file
export { ROLE_HIERARCHY, MFA_REQUIRED_ROLES };

// ─── Middleware factory ──────────────────────────────────────────────────────────

/**
 * Require specific roles to access this route.
 * Usage: requireRoles('SUPER_ADMIN', 'HIEU_TRUONG')
 */
export function requireRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
      });
      return;
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      logger.warn('Role access denied', { userId: req.user._id, role: userRole, required: allowedRoles });
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền truy cập trang này' },
      });
      return;
    }

    next();
  };
}

/**
 * Require minimum role level (based on hierarchy).
 * Usage: requireMinRole('TRUONG_KHOA') — allows TRUONG_KHOA and above
 */
export function requireMinRole(minRole: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
      });
      return;
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;

    if (userLevel < requiredLevel) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Cấp bậc không đủ để truy cập' },
      });
      return;
    }

    next();
  };
}

/**
 * Require specific permission string.
 * Usage: requirePermission('user:create')
 */
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Chưa đăng nhập' },
      });
      return;
    }

    if (!req.user.permissions?.includes(permission)) {
      logger.warn('Permission denied', { userId: req.user._id, permission });
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền thực hiện thao tác này' },
      });
      return;
    }

    next();
  };
}
