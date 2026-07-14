import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// JWT Payload interface
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// Generate access token (short-lived: 15 minutes)
export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
};

// Generate refresh token (long-lived: 7 days)
export const signRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

// Verify access token
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
};

// Verify refresh token
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};

// Decode token without verification (for debugging)
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded?.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};
