import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IIntegration extends Document {
  _id: Types.ObjectId;
  name: string;
  system: string; // HEMIS, VNeID, VGCA, CSDLVB
  direction: 'push' | 'pull' | 'bidirectional';
  endpoint: string;
  apiKey?: string;
  status: 'active' | 'inactive' | 'error';
  lastSyncAt?: Date;
  lastSyncStatus?: 'success' | 'error';
  lastError?: string;
  syncIntervalMinutes: number;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSchema = new Schema<IIntegration>(
  {
    name: { type: String, required: true, unique: true, text: true },
    system: { type: String, required: true, index: true },
    direction: { type: String, enum: ['push', 'pull', 'bidirectional'], required: true },
    endpoint: { type: String, required: true },
    apiKey: { type: String, select: false },
    status: { type: String, enum: ['active', 'inactive', 'error'], default: 'inactive', index: true },
    lastSyncAt: Date,
    lastSyncStatus: { type: String, enum: ['success', 'error'] },
    lastError: String,
    syncIntervalMinutes: { type: Number, default: 60 },
    retryPolicy: {
      maxRetries: { type: Number, default: 3 },
      backoffMs: { type: Number, default: 5000 },
    },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

IntegrationSchema.index({ system: 1, status: 1 });

export const Integration = mongoose.model<IIntegration>('Integration', IntegrationSchema);

export interface IIntegrationLog extends Document {
  _id: Types.ObjectId;
  integrationId: Types.ObjectId;
  direction: 'push' | 'pull' | 'bidirectional';
  status: 'success' | 'error';
  httpStatus?: number;
  requestBody?: Record<string, unknown>;
  responseBody?: Record<string, unknown>;
  errorMessage?: string;
  durationMs: number;
  timestamp: Date;
}

const IntegrationLogSchema = new Schema<IIntegrationLog>(
  {
    integrationId: { type: Schema.Types.ObjectId, ref: 'Integration', required: true, index: true },
    direction: { type: String, enum: ['push', 'pull', 'bidirectional'], required: true },
    status: { type: String, enum: ['success', 'error'], required: true, index: true },
    httpStatus: Number,
    requestBody: { type: Schema.Types.Mixed },
    responseBody: { type: Schema.Types.Mixed },
    errorMessage: String,
    durationMs: Number,
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

IntegrationLogSchema.index({ integrationId: 1, timestamp: -1 });
IntegrationLogSchema.index({ status: 1, timestamp: -1 });

export const IntegrationLog = mongoose.model<IIntegrationLog>('IntegrationLog', IntegrationLogSchema);
