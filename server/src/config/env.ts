import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  
  // MongoDB
  MONGODB_URI: z.string().url(),
  
  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // TOTP
  TOTP_ISSUER: z.string().default('UMS-University'),
  TOTP_SECRET: z.string().default(''),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX: z.string().default('100'),
  
  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  
  // File Upload
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE_MB: z.string().default('10'),
  
  // MFA Required Roles
  MFA_REQUIRED_ROLES: z.string().default('SUPER_ADMIN,ADMIN,HIEU_TRUONG,PHO_HIEU_TRUONG'),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parseResult.error.format());
  process.exit(1);
}

export const env = parseResult.data;

// Additional parsed values
export const ALLOWED_ORIGINS = env.ALLOWED_ORIGINS.split(',').map(s => s.trim());
export const MFA_REQUIRED_ROLES = env.MFA_REQUIRED_ROLES.split(',').map(s => s.trim());
export const RATE_LIMIT_WINDOW_MS = parseInt(env.RATE_LIMIT_WINDOW_MS, 10);
export const RATE_LIMIT_MAX = parseInt(env.RATE_LIMIT_MAX, 10);
export const PORT = parseInt(env.PORT, 10);
export const MAX_FILE_SIZE_MB = parseInt(env.MAX_FILE_SIZE_MB, 10);
