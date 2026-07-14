import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Tenant Interface ───────────────────────────────────────────────────────
export interface ITenant extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  shortName?: string;
  domain?: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  type: 'university' | 'school' | 'department' | 'training_center';
  status: 'active' | 'trial' | 'suspended' | 'expired';
  plan: 'basic' | 'standard' | 'premium' | 'enterprise';
  maxUsers: number;
  storageQuotaGb: number;
  expiresAt?: Date;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Tenant Schema ──────────────────────────────────────────────────────────
const TenantSchema = new Schema<ITenant>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    shortName: { type: String, trim: true },
    domain: { type: String, lowercase: true, trim: true },
    logo: String,
    contactEmail: { type: String, lowercase: true, trim: true },
    contactPhone: String,
    address: String,
    type: {
      type: String,
      enum: ['university', 'school', 'department', 'training_center'],
      default: 'university',
    },
    status: {
      type: String,
      enum: ['active', 'trial', 'suspended', 'expired'],
      default: 'trial',
      index: true,
    },
    plan: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'enterprise'],
      default: 'standard',
    },
    maxUsers: { type: Number, default: 1000 },
    storageQuotaGb: { type: Number, default: 100 },
    expiresAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

TenantSchema.index({ name: 'text', code: 'text' });
TenantSchema.index({ status: 1, plan: 1 });

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);