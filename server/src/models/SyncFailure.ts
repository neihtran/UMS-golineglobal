import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── SyncFailure (Dead Letter Queue) ───────────────────────────────────────
// Lưu các lần sync thất bại, hỗ trợ retry với exponential backoff.

export interface ISyncFailure extends Document {
  _id: Types.ObjectId;
  entity: string;
  source: string;
  status: 'pending' | 'retrying' | 'resolved' | 'dead_letter';
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  payload?: Record<string, unknown>;
  nextRetryAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SyncFailureSchema = new Schema<ISyncFailure>(
  {
    entity: { type: String, required: true },
    source: { type: String, required: true, default: 'hqnhat' },
    status: {
      type: String,
      enum: ['pending', 'retrying', 'resolved', 'dead_letter'],
      default: 'pending',
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    lastError: String,
    payload: { type: Schema.Types.Mixed, default: {} },
    nextRetryAt: Date,
    resolvedAt: Date,
  },
  { timestamps: true }
);

SyncFailureSchema.index({ status: 1, nextRetryAt: 1 });

export const SyncFailure =
  mongoose.models.SyncFailure ||
  mongoose.model<ISyncFailure>('SyncFailure', SyncFailureSchema);
