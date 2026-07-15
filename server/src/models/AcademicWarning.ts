import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── AcademicWarning (Cảnh báo học vụ) ───────────────────────────────────────
// Quản lý cảnh báo học vụ cho sinh viên

export type WarningType = 'low_gpa' | 'failed_subject' | 'insufficient_credit' | 'academic_warning';

export interface IAcademicWarning extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;             // Ref: Student
  academicTerm: Types.ObjectId;       // Ref: AcademicTerm
  warningType: WarningType;
  warningLevel: number;               // 1, 2, 3 (ngày càng nghiêm trọng)
  // Details
  description: string;
  gpa?: number;                      // GPA tại thời điểm cảnh báo
  failedSubjects?: string[];         // Danh sách môn nợ
  creditDeficit?: number;            // Thiếu bao nhiêu tín chỉ
  // Resolution
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
  resolutionNote?: string;
  // Status
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicWarningSchema = new Schema<IAcademicWarning>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    academicTerm: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicTerm',
      required: true,
    },
    warningType: {
      type: String,
      enum: ['low_gpa', 'failed_subject', 'insufficient_credit', 'academic_warning'],
      required: true,
    },
    warningLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
      default: 1,
    },
    description: {
      type: String,
      required: true,
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4.0,
    },
    failedSubjects: {
      type: [String],
      default: [],
    },
    creditDeficit: {
      type: Number,
      min: 0,
    },
    resolvedAt: Date,
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolutionNote: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes
AcademicWarningSchema.index({ student: 1, academicTerm: 1 });
AcademicWarningSchema.index({ student: 1, isActive: 1 });
AcademicWarningSchema.index({ warningType: 1, isActive: 1 });
AcademicWarningSchema.index({ warningLevel: 1, isActive: 1 });

export const AcademicWarning = mongoose.model<IAcademicWarning>('AcademicWarning', AcademicWarningSchema);
