import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── AuditLog Interface ────────────────────────────────────────────────────
export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  userName?: string;
  userEmail?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'LOGIN' | 'LOGOUT' | 'ACCESS';
  resource: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  details?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// ─── AuditLog Schema ───────────────────────────────────────────────────────
const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: String,
    userEmail: String,
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', 'LOGOUT', 'ACCESS'],
      required: true,
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: String,
    ip: String,
    userAgent: String,
    status: {
      type: String,
      enum: ['success', 'failure'],
      required: true,
    },
    details: String,
    metadata: {
      type: Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We manage timestamp manually
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ status: 1, timestamp: -1 });

// TTL Index - auto-delete logs older than 1 year
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
