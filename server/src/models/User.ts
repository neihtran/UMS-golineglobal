import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

// ─── Role Constants ──────────────────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  HIEU_TRUONG: 'HIEU_TRUONG',
  PHO_HIEU_TRUONG: 'PHO_HIEU_TRUONG',
  TRUONG_KHOA: 'TRUONG_KHOA',
  PHO_TRUONG_KHOA: 'PHO_TRUONG_KHOA',
  GIAO_VIEN: 'GIAO_VIEN',
  CAN_BO_PHAN_CONG: 'CAN_BO_PHAN_CONG',
  CHUYEN_VIEN: 'CHUYEN_VIEN',
  NHAN_VIEN: 'NHAN_VIEN',
  SINH_VIEN: 'SINH_VIEN',
  KHAI_THA: 'KHAI_THA',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 90,
  HIEU_TRUONG: 80,
  PHO_HIEU_TRUONG: 70,
  TRUONG_KHOA: 60,
  PHO_TRUONG_KHOA: 50,
  GIAO_VIEN: 40,
  CAN_BO_PHAN_CONG: 35,
  CHUYEN_VIEN: 30,
  NHAN_VIEN: 20,
  SINH_VIEN: 10,
  KHAI_THA: 5,
};

// ─── User Interface ──────────────────────────────────────────────────────────
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  username: string;
  password: string;
  displayName: string;
  avatar?: string;
  role: Role;
  permissions: string[];
  department?: Types.ObjectId;
  title?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'locked' | 'pending';
  mfaEnabled: boolean;
  mfaSecret?: string;
  refreshToken?: string;
  lastLogin?: Date;
  lockReason?: 'manual' | 'failed_attempts' | 'policy' | 'inactive';
  failedLoginAttempts: number;
  passwordExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  hasRole(requiredRole: Role): boolean;
}

// ─── User Schema ─────────────────────────────────────────────────────────────
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't include password in queries by default
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: String,
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      default: 'NHAN_VIEN',
    },
    permissions: {
      type: [String],
      default: [],
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    title: String,
    phone: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'locked', 'pending'],
      default: 'active',
    },
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaSecret: {
      type: String,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    lastLogin: Date,
    lockReason: {
      type: String,
      enum: ['manual', 'failed_attempts', 'policy', 'inactive'],
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    passwordExpiresAt: Date,
  },
  { timestamps: true }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
// Note: email & username already get indexes from `unique: true` above
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

// ─── Pre-save Hook ──────────────────────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// ─── Methods ────────────────────────────────────────────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.isLocked = function (): boolean {
  return this.status === 'locked' || this.lockReason === 'failed_attempts';
};

UserSchema.methods.hasRole = function (requiredRole: Role): boolean {
  return ROLE_HIERARCHY[this.role] >= ROLE_HIERARCHY[requiredRole];
};

// ─── Statics ────────────────────────────────────────────────────────────────
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findByUsername = function (username: string) {
  return this.findOne({ username });
};

UserSchema.statics.createWithRole = async function (data: Partial<IUser>, role: Role = 'NHAN_VIEN') {
  const user = new this({ ...data, role });
  await user.save();
  return user;
};

export const User = mongoose.model<IUser>('User', UserSchema);
