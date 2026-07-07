import mongoose, { Schema, Document, Types } from 'mongoose';

export type VCStatus = 'active' | 'trial' | 'leave' | 'inactive';
export type ContractType = 'Cơ hữu' | 'Thỉnh giảng' | 'Thử việc';
export type Gender = 'Nam' | 'Nữ' | 'Khác';

export interface IVienChuc extends Document {
  _id: Types.ObjectId;
  code: string; // VC-YYYY-NNN
  name: string;
  dob?: Date;
  cccd?: string; // encrypted, never exposed in default queries
  gender?: Gender;
  ethnicity?: string;
  religion?: string;
  address?: string;
  phone?: string;
  email?: string;
  title?: string; // Học hàm: PGS.TS, TS, ThS
  position?: string; // Chức vụ: Trưởng khoa, Phó trưởng khoa
  department?: Types.ObjectId;
  contractType?: ContractType;
  salary?: number;
  status: VCStatus;
  joinDate?: Date;
  education?: string; // Trình độ chuyên môn
  major?: string; // Chuyên ngành
  school?: string; // Nơi đào tạo
  gradYear?: number;
  languages?: string[]; // Ngoại ngữ
  itLevel?: string; // Trình độ tin học
  insuranceNumber?: string;
  bankAccount?: string;
  avatar?: string;
  supervisor?: Types.ObjectId; // ref: VienChuc (Người quản lý trực tiếp)
  user?: Types.ObjectId; // ref: User (tài khoản hệ thống)
  contractStartDate?: Date;
  contractEndDate?: Date;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  auditLog: Array<{
    action: string;
    userId?: Types.ObjectId;
    timestamp: Date;
    details?: string;
  }>;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VienChucSchema = new Schema<IVienChuc>(
  {
    code: { type: String, unique: true, required: true },
    name: { type: String, required: true, text: true },
    dob: Date,
    cccd: { type: String, select: false },
    gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'] },
    ethnicity: String,
    religion: String,
    address: String,
    phone: String,
    email: { type: String, lowercase: true, trim: true },
    title: String,
    position: String,
    department: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    contractType: {
      type: String,
      enum: ['Cơ hữu', 'Thỉnh giảng', 'Thử việc'],
    },
    salary: Number,
    status: {
      type: String,
      enum: ['active', 'trial', 'leave', 'inactive'],
      default: 'active',
      index: true,
    },
    joinDate: Date,
    education: String,
    major: String,
    school: String,
    gradYear: Number,
    languages: [String],
    itLevel: String,
    insuranceNumber: String,
    bankAccount: String,
    avatar: String,
    supervisor: { type: Schema.Types.ObjectId, ref: 'VienChuc' },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    contractStartDate: Date,
    contractEndDate: Date,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    auditLog: [
      {
        action: String,
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        details: String,
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Indexes
VienChucSchema.index({ status: 1, department: 1 });
VienChucSchema.index({ name: 'text', code: 'text', email: 'text' });
VienChucSchema.index({ department: 1, position: 1 });
VienChucSchema.index({ contractType: 1, status: 1 });

export const VienChuc = mongoose.model<IVienChuc>('VienChuc', VienChucSchema);
