import mongoose, { Schema, Document, Types } from 'mongoose';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'ACCESS' | 'LOGIN' | 'LOGOUT' | 'APPROVE' | 'REJECT' | 'EXPORT';
export type AuditStatus = 'success' | 'failure';

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  ip: string;
  userAgent: string;
  status: AuditStatus;
  details?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'ACCESS', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'EXPORT'],
      required: true,
      index: true,
    },
    resource: { type: String, required: true, index: true },
    resourceId: String,
    ip: { type: String, default: 'unknown' },
    userAgent: { type: String, default: 'unknown' },
    status: { type: String, enum: ['success', 'failure'], required: true },
    details: String,
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false } // we manage timestamp manually
);

// Compound indexes for common queries
AuditLogSchema.index({ timestamp: -1, action: 1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, action: 1, timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
