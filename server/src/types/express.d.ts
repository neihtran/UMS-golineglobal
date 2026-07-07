// ─── Express Request Extension ───────────────────────────────────────────────────
// Adds custom properties to Express Request object

import { Types } from 'mongoose';

// Re-export types used across the app
export type { Types };

// User attached by auth middleware
export interface AuthUser {
  _id: Types.ObjectId;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: string;
  permissions: string[];
  department?: Types.ObjectId;
  title?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'locked' | 'pending';
  mfaEnabled: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      auditContext?: {
        action: string;
        resource: string;
        resourceId?: string;
      };
    }
  }
}

export {};
