import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Subject (Môn học) ──────────────────────────────────────────────────
// Môn học tổng quát, không chứa semester (semester thuộc về Course trong CTĐT)

export interface ISubject extends Document {
  _id: Types.ObjectId;
  code: string;              // Mã môn học (e.g., "MATH")
  name: string;             // Tên môn học
  description?: string;
  department?: Types.ObjectId;
  subjectType?: Types.ObjectId;  // Ref: SubjectType (loại môn học - mới)
  theoryHours?: number;         // Giờ lý thuyết (mới)
  practiceHours?: number;      // Giờ thực hành (mới)
  labHours?: number;           // Giờ lab (mới)
  credits?: number;            // Số tín chỉ (mới)
  courseGroup?: Types.ObjectId;  // Nhóm học phần mặc định
  isActive: boolean;
  externalId?: number;
  externalSource?: 'hqnhat' | 'manual';
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
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
    description: String,
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    subjectType: {
      type: Schema.Types.ObjectId,
      ref: 'SubjectType',
    },
    theoryHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    practiceHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    labHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    credits: {
      type: Number,
      min: 0,
    },
    courseGroup: {
      type: Schema.Types.ObjectId,
      ref: 'CourseGroup',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
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
  },
  { timestamps: true }
);

// Indexes (code unique auto-created via `unique: true`)
SubjectSchema.index({ name: 'text', code: 'text' });
SubjectSchema.index({ isActive: 1 });
SubjectSchema.index({ externalSource: 1, externalId: 1 }, { sparse: true });
SubjectSchema.index({ subjectType: 1 });

export const Subject = mongoose.model<ISubject>('Subject', SubjectSchema);
