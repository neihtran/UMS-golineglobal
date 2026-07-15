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
  
  // Enable CORS — must run BEFORE helmet so security headers don't override
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      // In development, allow all origins (Vite proxies etc.)
      if (env.NODE_ENV === 'development') return callback(null, true);
      // Production: check against explicit allowlist
      if (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*')) {
        return callback(null, true);
      }
      callback(new Error(`CORS policy violation: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400,
  }));

  // Set security HTTP headers — relax cross-origin policies to allow the API
  // to be consumed by the Vite dev server and other frontends on different ports
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    })
  );

  // ─── Body Parsing ────────────────────────────────────────────────────────────

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Explicit OPTIONS handler — ensures preflight returns 204 instead of 405
  app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    res.sendStatus(204);
  });

  // ─── Raw Body Capture (for webhook signature verification) ──────────────────
  // Must be BEFORE express.json() to capture raw bytes for HMAC verification
  app.use('/api/webhooks', express.json({
    limit: '10mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }));

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
