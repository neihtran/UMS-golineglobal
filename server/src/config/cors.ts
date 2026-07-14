import cors from 'cors';
import { ALLOWED_ORIGINS, env } from './env.js';

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all localhost ports
    if (env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error(`CORS policy violation: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};
