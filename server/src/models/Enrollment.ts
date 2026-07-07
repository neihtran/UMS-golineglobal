import mongoose, { Schema, Document, Types } from 'mongoose';

export type EnrollmentStatus = 'registered' | 'studying' | 'completed' | 'dropped' | 'failed';

export interface IEnrollment extends Document {
  _id: Types.ObjectId;
  studentId: string; // ref-like, links to Student.studentId
  subjectId: string;
  subjectName?: string;
  semester: string; // "1" | "2" | "Hè"
  academicYear: string; // "2024-2025"
  classGroup?: string;
  status: EnrollmentStatus;
  scoreFormative?: number;
  scoreMidterm?: number;
  scoreFinal?: number;
  grade?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: { type: String, required: true, index: true },
    subjectId: { type: String, required: true, index: true },
    subjectName: String,
    semester: { type: String, required: true, index: true },
    academicYear: { type: String, required: true, index: true },
    classGroup: String,
    status: {
      type: String,
      enum: ['registered', 'studying', 'completed', 'dropped', 'failed'],
      default: 'registered',
      index: true,
    },
    scoreFormative: { type: Number, min: 0, max: 10 },
    scoreMidterm: { type: Number, min: 0, max: 10 },
    scoreFinal: { type: Number, min: 0, max: 10 },
    grade: String,
    note: String,
  },
  { timestamps: true }
);

EnrollmentSchema.index({ studentId: 1, academicYear: 1 });
EnrollmentSchema.index({ subjectId: 1, semester: 1, academicYear: 1 });
EnrollmentSchema.index({ academicYear: 1, semester: 1, status: 1 });

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
