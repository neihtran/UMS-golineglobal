import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Course (Lớp học phần) ────────────────────────────────────────────────
// Lớp học phần cụ thể trong một học kỳ

export interface ICourse extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  subject?: Types.ObjectId;      // Ref Subject (học phần)
  semester?: number;
  academicYear?: string;
  schedule?: string;
  room?: string;
  lecturer?: Types.ObjectId;     // Ref User/VienChuc
  department?: Types.ObjectId;
  maxStudents?: number;
  currentStudents?: number;
  status: 'draft' | 'open' | 'closed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  externalId?: number;
  externalSource?: 'hqnhat' | 'manual';
  lastSyncedAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      index: true,
    },
    semester: {
      type: Number,
      min: 1,
      max: 12,
    },
    academicYear: {
      type: String,
    },
    schedule: String,
    room: String,
    lecturer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    maxStudents: {
      type: Number,
      default: 50,
      min: 1,
    },
    currentStudents: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'open', 'closed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    startDate: Date,
    endDate: Date,
    externalId: {
      type: Number,
      sparse: true,
    },
    externalSource: {
      type: String,
      enum: ['hqnhat', 'manual'],
      default: 'manual',
    },
    lastSyncedAt: Date,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Indexes
CourseSchema.index({ code: 1 }, { unique: true });
CourseSchema.index({ name: 'text', code: 'text' });
CourseSchema.index({ semester: 1, academicYear: 1 });
CourseSchema.index({ status: 1, semester: 1 });
CourseSchema.index({ externalSource: 1, externalId: 1 }, { sparse: true });

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
