import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGraduation extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  session: Types.ObjectId;
  cohort: string;
  enrollmentDate: Date;
  graduationYear: number;
  graduationSemester: string;
  gpa: number;
  totalCredits: number;
  thesisTitle?: string;
  thesisScore?: number;
  thesisAdvisor?: string;
  thesisDefendedAt?: Date;
  degree: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Trung bình';
  diplomaNo?: string;
  diplomaDate?: Date;
  status: 'pending_review' | 'graduated' | 'diploma_issued' | 'not_met';
  conditions: Array<{
    code: string;
    label: string;
    required: string;
    actual: string;
    met: boolean;
  }>;
  notes?: string;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GraduationSchema = new Schema<IGraduation>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    session: { type: Schema.Types.ObjectId, ref: 'GraduationSession', required: true },
    cohort: { type: String, required: true, trim: true },
    enrollmentDate: { type: Date, required: true },
    graduationYear: { type: Number, required: true, min: 2000, max: 2100 },
    graduationSemester: { type: String, required: true, trim: true },
    gpa: { type: Number, required: true, min: 0, max: 4 },
    totalCredits: { type: Number, required: true, min: 0 },
    thesisTitle: String,
    thesisScore: { type: Number, min: 0, max: 10 },
    thesisAdvisor: String,
    thesisDefendedAt: Date,
    degree: {
      type: String,
      enum: ['Xuất sắc', 'Giỏi', 'Khá', 'Trung bình'],
      required: true,
    },
    diplomaNo: { type: String, sparse: true, unique: true },
    diplomaDate: Date,
    status: {
      type: String,
      enum: ['pending_review', 'approved', 'graduated', 'diploma_issued', 'not_met'],
      default: 'pending_review',
    },
    conditions: [
      {
        code: { type: String, required: true },
        label: { type: String, required: true },
        required: { type: String, required: true },
        actual: { type: String, required: true },
        met: { type: Boolean, default: false },
      },
    ],
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

GraduationSchema.index({ student: 1, session: 1 }, { unique: true });
GraduationSchema.index({ status: 1, graduationYear: -1 });

export const Graduation = mongoose.model<IGraduation>('Graduation', GraduationSchema);