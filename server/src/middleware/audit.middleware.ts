import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog.js';

// Audit action types
type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'LOGIN' | 'LOGOUT' | 'ACCESS';

// Audit middleware factory
export const auditMiddleware = (resource: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const action = getActionFromMethod(req.method);

        // Fire-and-forget audit log (non-blocking)
        AuditLog.create({
          userId: req.user._id,
          userName: req.user.displayName,
          userEmail: req.user.email,
          action,
          resource,
          resourceId: body?.data?._id || body?.data?.id || req.params?.id,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          status: 'success',
          details: `${action} ${resource}${req.params?.id ? ` (${req.params.id})` : ''}`,
          timestamp: new Date(),
        }).catch((err) => {
          console.error('Audit log error:', err);
        });
      }

      return originalJson(body);
    };

    next();
  };
};

// Map HTTP method to audit action
function getActionFromMethod(method: string): AuditAction {
  switch (method) {
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'ACCESS';
  }
}

// Manual audit log function
export const createAuditLog = async (
  userId: string,
  userName: string,
  userEmail: string,
  action: AuditAction,
  resource: string,
  resourceId?: string,
  details?: string,
  ip?: string,
  userAgent?: string,
  status: 'success' | 'failure' = 'success'
): Promise<void> => {
  try {
    await AuditLog.create({
      userId,
      userName,
      userEmail,
      action,
      resource,
      resourceId,
      ip,
      userAgent,
      status,
      details,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};
