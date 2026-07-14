import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Session Interface ──────────────────────────────────────────────────────
export interface ISession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  token: string;
  refreshToken?: string;
  ip?: string;
  userAgent?: string;
  device?: string;
  location?: string;
  isActive: boolean;
  lastActivityAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Session Schema ─────────────────────────────────────────────────────────
const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, unique: true },
    refreshToken: String,
    ip: String,
    userAgent: String,
    device: String,
    location: String,
    isActive: { type: Boolean, default: true, index: true },
    lastActivityAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

SessionSchema.index({ userId: 1, isActive: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model<ISession>('Session', SessionSchema);