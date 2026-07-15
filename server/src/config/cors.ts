import cors from 'cors';
import { ALLOWED_ORIGINS, env } from './env.js';

const ALLOW_DEV = env.NODE_ENV === 'development';
const ALLOW_ALL = ALLOWED_ORIGINS.includes('*');

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // In development or when wildcard is configured, allow all origins
    if (ALLOW_DEV || ALLOW_ALL) return callback(null, true);

    // Production: enforce explicit allowlist
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);

    callback(new Error(`CORS policy violation: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};
