import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEnrollment extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  course: Types.ObjectId;
  status: 'enrolled' | 'in_progress' | 'completed' | 'failed' | 'withdrawn';
  enrollmentDate: Date;
  midtermScore?: number;
  finalScore?: number;
  totalScore?: number;
  letterGrade?: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F';
  attendanceCount?: number;
  totalSessions?: number;
  notes?: string;
  gradedBy?: Types.ObjectId;
  gradedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    status: {
      type: String,
      enum: ['enrolled', 'in_progress', 'completed', 'failed', 'withdrawn'],
      default: 'enrolled',
      index: true,
    },
    enrollmentDate: { type: Date, default: Date.now },
    midtermScore: { type: Number, min: 0, max: 10 },
    finalScore: { type: Number, min: 0, max: 10 },
    totalScore: { type: Number, min: 0, max: 10 },
    letterGrade: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'] },
    attendanceCount: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    notes: String,
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    gradedAt: Date,
  },
  { timestamps: true }
);

EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
EnrollmentSchema.index({ status: 1, course: 1 });

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);