import mongoose, { Schema, Document, Types } from 'mongoose';

export type StudentStatus = 'studying' | 'graduated' | 'suspended' | 'transferred' | 'dropped';
export type EducationLevel = 'CĐ' | 'TC' | 'ĐH' | 'CQ' | 'LV' | 'TH';

export interface IStudent extends Document {
  _id: Types.ObjectId;
  studentId: string; // SV-YYYY-NNNNN
  name: string;
  dob?: Date;
  cccd?: string; // select: false
  gender?: 'Nam' | 'Nữ' | 'Khác';
  ethnicity?: string;
  religion?: string;
  address?: string;
  phone?: string;
  email?: string;
  department?: Types.ObjectId;
  major?: string;
  educationLevel?: EducationLevel;
  className?: string;
  admissionDate?: Date;
  expectedGradDate?: Date;
  status: StudentStatus;
  gpa?: number;
  creditsEarned: number;
  creditsRequired: number;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  avatar?: string;
  user?: Types.ObjectId; // ref: User (linked account)
  auditLog: Array<{
    action: string;
    userId?: Types.ObjectId;
    timestamp: Date;
    details?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    studentId: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true, text: true },
    dob: Date,
    cccd: { type: String, select: false },
    gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'] },
    ethnicity: String,
    religion: String,
    address: String,
    phone: String,
    email: { type: String, lowercase: true, trim: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    major: String,
    educationLevel: {
      type: String,
      enum: ['CĐ', 'TC', 'ĐH', 'CQ', 'LV', 'TH'],
    },
    className: String,
    admissionDate: Date,
    expectedGradDate: Date,
    status: {
      type: String,
      enum: ['studying', 'graduated', 'suspended', 'transferred', 'dropped'],
      default: 'studying',
      index: true,
    },
    gpa: { type: Number, min: 0, max: 10 },
    creditsEarned: { type: Number, default: 0 },
    creditsRequired: { type: Number, default: 0 },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    avatar: String,
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    auditLog: [
      {
        action: String,
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        details: String,
      },
    ],
  },
  { timestamps: true }
);

StudentSchema.index({ status: 1, department: 1 });
StudentSchema.index({ name: 'text', studentId: 'text', email: 'text' });
StudentSchema.index({ className: 1, status: 1 });
StudentSchema.index({ educationLevel: 1, admissionDate: 1 });

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
