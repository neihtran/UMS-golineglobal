import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── VienChuc Interface ────────────────────────────────────────────────────
export interface IVienChuc extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  dob?: Date;
  cccd?: string;
  gender?: 'Nam' | 'Nữ';
  ethnicity?: string;
  religion?: string;
  address?: string;
  contact?: string;
  phone?: string;
  email?: string;
  title?: string;
  position?: string;
  department?: Types.ObjectId;
  contractType?: 'Cơ hữu' | 'Thỉnh giảng' | 'Thử việc';
  salary?: number;
  status: 'active' | 'trial' | 'leave' | 'inactive';
  joinDate?: Date;
  education?: string;
  major?: string;
  school?: string;
  gradYear?: number;
  mfaEnabled?: boolean;
  avatar?: string;
  supervisor?: Types.ObjectId;
  user?: Types.ObjectId; // Link to User account
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  auditLog: Array<{
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT';
    userId: Types.ObjectId;
    timestamp: Date;
    details?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// ─── VienChuc Schema ────────────────────────────────────────────────────────
const VienChucSchema = new Schema<IVienChuc>(
  {
    code: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      text: true,
      trim: true,
    },
    dob: Date,
    cccd: {
      type: String,
      select: false, // Hidden from default queries
      sparse: true,
    },
    gender: {
      type: String,
      enum: ['Nam', 'Nữ'],
    },
    ethnicity: String,
    religion: String,
    address: String,
    contact: String,
    phone: String,
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    title: String,
    position: String,
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      index: true,
    },
    contractType: {
      type: String,
      enum: ['Cơ hữu', 'Thỉnh giảng', 'Thử việc'],
    },
    salary: Number,
    status: {
      type: String,
      enum: ['active', 'trial', 'leave', 'inactive'],
      default: 'active',
    },
    joinDate: Date,
    education: String,
    major: String,
    school: String,
    gradYear: Number,
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    avatar: String,
    supervisor: {
      type: Schema.Types.ObjectId,
      ref: 'VienChuc',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    auditLog: [
      {
        action: {
          type: String,
          enum: ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'],
        },
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        details: String,
      },
    ],
  },
  { timestamps: true }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
VienChucSchema.index({ code: 1 }, { unique: true });
VienChucSchema.index({ status: 1, department: 1 });
VienChucSchema.index({ name: 'text', code: 'text' });
VienChucSchema.index({ email: 1 }, { unique: true, sparse: true });
VienChucSchema.index({ phone: 1 }, { sparse: true });

// ─── Methods ────────────────────────────────────────────────────────────────
VienChucSchema.methods.addAuditLog = function (
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT',
  userId: Types.ObjectId,
  details?: string
) {
  this.auditLog.push({
    action,
    userId,
    timestamp: new Date(),
    details,
  });
};

export const VienChuc = mongoose.model<IVienChuc>('VienChuc', VienChucSchema);
