import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Enrollment (Đăng ký học phần / Bảng điểm) ───────────────────────────────
// Phase 2: Mở rộng với điểm thành phần, khóa điểm, academicTerm

export interface IEnrollment extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;            // Ref: Student
  course: Types.ObjectId;              // Ref: Course (lớp học phần)
  academicTerm: Types.ObjectId;       // Ref: AcademicTerm (học kỳ)
  // Registration
  registeredAt: Date;                // Ngày đăng ký (default: now)
  cancelledAt?: Date;                // Ngày hủy đăng ký
  status: 'registered' | 'cancelled' | 'completed';
  // Scores
  attendanceScore?: number;          // Điểm chuyên cần (0-10)
  assignmentScore?: number;          // Điểm bài tập (0-10)
  midtermScore?: number;             // Điểm giữa kỳ (0-10)
  finalScore?: number;               // Điểm cuối kỳ (0-10)
  totalScore?: number;               // Tổng điểm (0-10)
  letterGrade?: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F';
  gradePoint?: number;              // Điểm hệ 4 (0-4.0)
  isPass?: boolean;                 // Đạt/Không đạt
  // Grading
  gradedBy?: Types.ObjectId;        // Người chấm điểm
  gradedAt?: Date;
  // Lock mechanism
  isLocked: boolean;                 // Đã khóa điểm
  lockedAt?: Date;
  lockedBy?: Types.ObjectId;
  // Legacy fields (kept for migration)
  midtermScoreLegacy?: number;
  finalScoreLegacy?: number;
  totalScoreLegacy?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    academicTerm: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicTerm',
      required: true,
    },
    // Registration
    registeredAt: { type: Date, default: Date.now },
    cancelledAt: Date,
    status: {
      type: String,
      enum: ['registered', 'cancelled', 'completed'],
      default: 'registered',
    },
    // Scores (0-10 scale)
    attendanceScore: { type: Number, min: 0, max: 10 },
    assignmentScore: { type: Number, min: 0, max: 10 },
    midtermScore: { type: Number, min: 0, max: 10 },
    finalScore: { type: Number, min: 0, max: 10 },
    totalScore: { type: Number, min: 0, max: 10 },
    letterGrade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'],
    },
    gradePoint: { type: Number, min: 0, max: 4.0 },
    isPass: Boolean,
    // Grading
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    gradedAt: Date,
    // Lock mechanism
    isLocked: { type: Boolean, default: false },
    lockedAt: Date,
    lockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    // Legacy
    notes: String,
  },
  { timestamps: true }
);

// Compound indexes
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
EnrollmentSchema.index({ student: 1, academicTerm: 1 });
EnrollmentSchema.index({ course: 1, academicTerm: 1 });
EnrollmentSchema.index({ status: 1, academicTerm: 1 });
EnrollmentSchema.index({ isLocked: 1, academicTerm: 1 });

// Pre-save: calculate total score and letter grade
EnrollmentSchema.pre('save', function (next) {
  const scores = [this.attendanceScore, this.assignmentScore, this.midtermScore, this.finalScore].filter(
    (s) => s !== undefined && s !== null
  );

  if (scores.length > 0 && this.finalScore !== undefined) {
    // Calculate total score (weighted average)
    // Default weights: attendance 10%, assignment 20%, midterm 30%, final 40%
    let total = 0;
    let weightSum = 0;
    const weights = {
      attendanceScore: 0.1,
      assignmentScore: 0.2,
      midtermScore: 0.3,
      finalScore: 0.4,
    };

    if (this.attendanceScore !== undefined) {
      total += this.attendanceScore * weights.attendanceScore;
      weightSum += weights.attendanceScore;
    }
    if (this.assignmentScore !== undefined) {
      total += this.assignmentScore * weights.assignmentScore;
      weightSum += weights.assignmentScore;
    }
    if (this.midtermScore !== undefined) {
      total += this.midtermScore * weights.midtermScore;
      weightSum += weights.midtermScore;
    }
    if (this.finalScore !== undefined) {
      total += this.finalScore * weights.finalScore;
      weightSum += weights.finalScore;
    }

    if (weightSum > 0) {
      this.totalScore = Math.round((total / weightSum) * 100) / 100;
      this.isPass = this.totalScore >= 5.0;
      this.status = 'completed';

      // Calculate letter grade
      if (this.totalScore >= 9.0) {
        this.letterGrade = 'A+';
        this.gradePoint = 4.0;
      } else if (this.totalScore >= 8.5) {
        this.letterGrade = 'A';
        this.gradePoint = 3.7;
      } else if (this.totalScore >= 8.0) {
        this.letterGrade = 'B+';
        this.gradePoint = 3.5;
      } else if (this.totalScore >= 7.0) {
        this.letterGrade = 'B';
        this.gradePoint = 3.0;
      } else if (this.totalScore >= 6.5) {
        this.letterGrade = 'C+';
        this.gradePoint = 2.5;
      } else if (this.totalScore >= 5.5) {
        this.letterGrade = 'C';
        this.gradePoint = 2.0;
      } else if (this.totalScore >= 5.0) {
        this.letterGrade = 'D+';
        this.gradePoint = 1.5;
      } else if (this.totalScore >= 4.0) {
        this.letterGrade = 'D';
        this.gradePoint = 1.0;
      } else {
        this.letterGrade = 'F';
        this.gradePoint = 0;
      }
    }
  }

  next();
});

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
