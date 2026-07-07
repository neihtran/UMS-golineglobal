import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async route handler so you don't need try/catch in every controller.
 * Any rejected promise is forwarded to Express error handler.
 */
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
