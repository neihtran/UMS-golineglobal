import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { config } from 'dotenv';

config(); // load .env

import { errorHandler } from '@/middleware/error.middleware.js';
import { auditMiddleware } from '@/middleware/audit.middleware.js';
import routes from '@/routes/index.js';

export function createApp(): Express {
  const app = express();

  // ─── Security & Core middleware ──────────────────────────────────────────────
  app.use(helmet());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ─── CORS ───────────────────────────────────────────────────────────────────
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin ${origin} not allowed`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // ─── Rate limiting ────────────────────────────────────────────────────────────
  const globalLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT',
        message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.',
      },
    },
  });
  app.use('/api', globalLimiter);

  // ─── Health check ─────────────────────────────────────────────────────────────
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ─── Audit middleware (logs all write operations) ────────────────────────────
  app.use('/api', auditMiddleware as any);

  // ─── API Routes ───────────────────────────────────────────────────────────────
  app.use('/api', routes);

  // ─── 404 handler ─────────────────────────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Endpoint không tồn tại' },
    });
  });

  // ─── Global error handler ─────────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
