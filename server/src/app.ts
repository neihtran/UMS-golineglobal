import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { globalRateLimiter } from './config/rateLimit.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware.js';
import routes from './routes/index.js';
import { ALLOWED_ORIGINS, env } from './config/env.js';

export function createApp(): Express {
  const app = express();

  // ─── Security Middleware ──────────────────────────────────────────────────────
  
  // Set security HTTP headers
  app.use(helmet());

  // Enable CORS
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (env.NODE_ENV === 'development' || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS policy violation: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // ─── Body Parsing ────────────────────────────────────────────────────────────
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ─── Logging ─────────────────────────────────────────────────────────────────
  
  // Skip logging in test environment
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  // ─── Rate Limiting ──────────────────────────────────────────────────────────
  
  app.use(globalRateLimiter);

  // ─── Static Files ────────────────────────────────────────────────────────────
  
  // Serve uploaded files (if any)
  app.use('/uploads', express.static('uploads'));

  // ─── API Routes ───────────────────────────────────────────────────────────────
  
  app.use('/api', routes);

  // ─── Root Route ──────────────────────────────────────────────────────────────
  
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Welcome to UMS API',
      version: '1.0.0',
      documentation: '/api/health',
    });
  });

  // ─── Error Handling ───────────────────────────────────────────────────────────
  
  // 404 handler
  app.use(notFoundMiddleware);

  // Global error handler
  app.use(errorMiddleware);

  return app;
}
