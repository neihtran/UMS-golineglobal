import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── GPAHistory (Lịch sử GPA) ────────────────────────────────────────────────
// Lưu GPA/CPA theo từng học kỳ

export type AcademicRank = 'Excellent' | 'Very Good' | 'Good' | 'Average' | 'Weak' | 'Poor';

export interface IGPAHistory extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;             // Ref: Student
  academicTerm: Types.ObjectId;        // Ref: AcademicTerm
  // Credits
  registeredCredit: number;            // Tín chỉ đã đăng ký
  earnedCredit: number;               // Tín chỉ đạt
  accumulatedCredit: number;          // Tín chỉ tích lũy
  // GPA
  semesterGpa: number;                // GPA học kỳ (0-4.0)
  cumulativeGpa: number;              // CPA tích lũy (0-4.0)
  // Rank
  academicRank: AcademicRank;
  // Scores summary
  totalSubjects: number;
  passedSubjects: number;
  failedSubjects: number;
  // Metadata
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GPAHistorySchema = new Schema<IGPAHistory>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    academicTerm: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicTerm',
      required: true,
      index: true,
    },
    registeredCredit: {
      type: Number,
      required: true,
      min: 0,
    },
    earnedCredit: {
      type: Number,
      default: 0,
      min: 0,
    },
    accumulatedCredit: {
      type: Number,
      default: 0,
      min: 0,
    },
    semesterGpa: {
      type: Number,
      required: true,
      min: 0,
      max: 4.0,
    },
    cumulativeGpa: {
      type: Number,
      required: true,
      min: 0,
      max: 4.0,
    },
    academicRank: {
      type: String,
      enum: ['Excellent', 'Very Good', 'Good', 'Average', 'Weak', 'Poor'],
      required: true,
    },
    totalSubjects: {
      type: Number,
      default: 0,
    },
    passedSubjects: {
      type: Number,
      default: 0,
    },
    failedSubjects: {
      type: Number,
      default: 0,
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound unique index: each student can only have 1 GPA record per term
GPAHistorySchema.index({ student: 1, academicTerm: 1 }, { unique: true });
GPAHistorySchema.index({ student: 1, cumulativeGpa: -1 });

// Static method to calculate academic rank from GPA
GPAHistorySchema.statics.calculateRank = function (gpa: number): AcademicRank {
  if (gpa >= 3.6) return 'Excellent';
  if (gpa >= 3.2) return 'Very Good';
  if (gpa >= 2.5) return 'Good';
  if (gpa >= 2.0) return 'Average';
  if (gpa >= 1.5) return 'Weak';
  return 'Poor';
};

export const GPAHistory = mongoose.model<IGPAHistory>('GPAHistory', GPAHistorySchema);
