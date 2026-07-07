import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '@/models/AuditLog.js';
import { logger } from '@/utils/logger.js';

/**
 * Audit middleware — intercepts res.json() to log all write operations.
 * Fire-and-forget (non-blocking) audit logging.
 */
export function auditMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const method = req.method;

  if (!writeMethods.includes(method)) {
    next();
    return;
  }

  // Capture original res.json
  const originalJson = _res.json.bind(_res);

  _res.json = function (body: unknown) {
    const statusOk = _res.statusCode >= 200 && _res.statusCode < 300;

    if (statusOk && req.user) {
      const action =
        method === 'POST'
          ? 'CREATE'
          : method === 'PUT' || method === 'PATCH'
          ? 'UPDATE'
          : 'DELETE';

      // Extract resource from path (e.g. /api/vien-chuc → VienChuc)
      const pathParts = req.path.split('/').filter(Boolean);
      const resource =
        pathParts.length >= 2
          ? pathParts[1]
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join('')
          : pathParts[0] || 'Unknown';

      // Extract resourceId from body or params
      const resourceId =
        (body as any)?.data?._id?.toString?.() ||
        req.params?.id ||
        undefined;

      // Fire-and-forget
      AuditLog.create({
        userId: req.user._id,
        userName: req.user.displayName || req.user.email,
        action,
        resource,
        resourceId: resourceId?.toString(),
        ip: (req.ip as string) || req.socket.remoteAddress || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        status: 'success',
        details: `${action} ${resource}${resourceId ? ` (${resourceId})` : ''}`,
      }).catch((err) => logger.error('Audit log failed', { error: err }));
    }

    return originalJson(body);
  };

  next();
}
