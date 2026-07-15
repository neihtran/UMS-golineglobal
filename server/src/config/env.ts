import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000'),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  MONGODB_URI: required('MONGODB_URI'),

  JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  TOTP_SECRET: process.env.TOTP_SECRET || '',
  TOTP_ISSUER: process.env.TOTP_ISSUER || 'UMS-University',

  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'),

  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '10'),

  MFA_REQUIRED_ROLES: (process.env.MFA_REQUIRED_ROLES || 'SUPER_ADMIN,ADMIN,HIEU_TRUONG,PHO_HIEU_TRUONG').split(','),

  // HQNHAT API
  HQNHAT_API_URL: process.env.HQNHAT_API_URL || 'https://api.hqnhat.id.vn',
  HQNHAT_API_TOKEN: process.env.HQNHAT_API_TOKEN || '',
  HQNHAT_API_USERNAME: process.env.HQNHAT_API_USERNAME || '',
  HQNHAT_API_PASSWORD: process.env.HQNHAT_API_PASSWORD || '',
  HQNHAT_API_TIMEOUT_MS: parseInt(process.env.HQNHAT_API_TIMEOUT_MS || '30000'),
  HQNHAT_API_RETRY_MAX: parseInt(process.env.HQNHAT_API_RETRY_MAX || '3'),

  HQNHAT_SYNC_ENABLED: process.env.HQNHAT_SYNC_ENABLED === 'true',
  HQNHAT_SYNC_FACULTIES_CRON: process.env.HQNHAT_SYNC_FACULTIES_CRON || '0 2 * * *',
  HQNHAT_SYNC_MAJORS_CRON: process.env.HQNHAT_SYNC_MAJORS_CRON || '0 3 * * *',
  HQNHAT_SYNC_COURSEGROUPS_CRON: process.env.HQNHAT_SYNC_COURSEGROUPS_CRON || '0 3 * * *',
  HQNHAT_SYNC_COURSES_CRON: process.env.HQNHAT_SYNC_COURSES_CRON || '0 4 * * *',
  HQNHAT_SYNC_CURRICULUMS_CRON: process.env.HQNHAT_SYNC_CURRICULUMS_CRON || '0 5 * * *',
  HQNHAT_SYNC_CLASSES_CRON: process.env.HQNHAT_SYNC_CLASSES_CRON || '*/30 * * * *',
  HQNHAT_SYNC_STUDENTS_CRON: process.env.HQNHAT_SYNC_STUDENTS_CRON || '*/30 * * * *',
};

// Named exports for compatibility
export const RATE_LIMIT_WINDOW_MS = env.RATE_LIMIT_WINDOW_MS;
export const RATE_LIMIT_MAX = env.RATE_LIMIT_MAX;
export const ALLOWED_ORIGINS = env.ALLOWED_ORIGINS;
export const PORT = env.PORT;
