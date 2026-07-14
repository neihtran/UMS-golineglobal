import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStudent extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  dob?: Date;
  gender?: 'Nam' | 'Nữ';
  cccd?: string;
  phone?: string;
  email?: string;
  address?: string;
  ethnicity?: string;
  department: Types.ObjectId;
  courseYear: number;
  className?: string;
  status: 'studying' | 'graduated' | 'suspended' | 'expelled' | 'reserved';
  enrollmentDate: Date;
  graduationDate?: Date;
  gpa?: number;
  totalCredits?: number;
  avatar?: string;
  user?: Types.ObjectId;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true, text: true },
    dob: Date,
    gender: { type: String, enum: ['Nam', 'Nữ'] },
    cccd: { type: String, select: false, sparse: true },
    phone: String,
    email: { type: String, lowercase: true, trim: true },
    address: String,
    ethnicity: String,
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    courseYear: { type: Number, required: true, min: 1, max: 10 },
    className: String,
    status: {
      type: String,
      enum: ['studying', 'graduated', 'suspended', 'expelled', 'reserved'],
      default: 'studying',
      index: true,
    },
    enrollmentDate: { type: Date, required: true },
    graduationDate: Date,
    gpa: { type: Number, min: 0, max: 4 },
    totalCredits: { type: Number, default: 0 },
    avatar: String,
    user: { type: Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

StudentSchema.index({ code: 1 }, { unique: true });
StudentSchema.index({ name: 'text', code: 'text' });
StudentSchema.index({ status: 1, department: 1 });
StudentSchema.index({ courseYear: 1 });

export const Student = mongoose.model<IStudent>('Student', StudentSchema);