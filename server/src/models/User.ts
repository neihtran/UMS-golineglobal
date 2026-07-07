import mongoose, { Schema, Document, Types } from 'mongoose';

export type UserStatus = 'active' | 'inactive' | 'locked' | 'pending';
export type MFAStatus = 'enabled' | 'disabled' | 'pending_setup';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  username: string;
  password: string;
  displayName: string;
  avatar?: string;
  role: string;
  permissions: string[];
  department?: Types.ObjectId;
  title?: string;
  phone?: string;
  status: UserStatus;
  mfaEnabled: MFAStatus;
  mfaSecret?: string; // stored encrypted, never exposed
  lastLogin?: Date;
  failedLoginAttempts: number;
  lockReason?: 'manual' | 'failed_attempts' | 'policy';
  refreshToken?: string;
  passwordExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false }, // hidden by default
    displayName: { type: String, required: true, text: true },
    avatar: String,
    role: { type: String, required: true, default: 'SINH_VIEN' },
    permissions: [{ type: String }],
    department: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    title: String,
    phone: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'locked', 'pending'],
      default: 'active',
      index: true,
    },
    mfaEnabled: {
      type: String,
      enum: ['enabled', 'disabled', 'pending_setup'],
      default: 'disabled',
    },
    mfaSecret: { type: String, select: false }, // NEVER expose in queries
    lastLogin: Date,
    failedLoginAttempts: { type: Number, default: 0 },
    lockReason: {
      type: String,
      enum: ['manual', 'failed_attempts', 'policy'],
    },
    refreshToken: { type: String, select: false },
    passwordExpiresAt: Date,
  },
  { timestamps: true }
);

// Compound indexes
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ department: 1, role: 1 });
UserSchema.index({ displayName: 'text', email: 'text', username: 'text' });

// Auto-lock after 5 failed attempts
UserSchema.pre('save', function (next) {
  if (this.failedLoginAttempts >= 5 && this.status === 'active') {
    this.status = 'locked';
    this.lockReason = 'failed_attempts';
  }
  next();
});

export const User = mongoose.model<IUser>('User', UserSchema);
