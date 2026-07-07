import mongoose, { Schema, Document, Types } from 'mongoose';

export type ExamSessionStatus = 'not_started' | 'in_progress' | 'submitted' | 'auto_submitted' | 'terminated';

export interface IExamSession extends Document {
  _id: Types.ObjectId;
  examId: string;
  examName?: string;
  studentId: string;
  studentName?: string;
  startedAt?: Date;
  submittedAt?: Date;
  status: ExamSessionStatus;
  score?: number;
  isPassed?: boolean;
  attemptsUsed: number;
  cheatEvents: Array<{
    type: string;
    timestamp: Date;
    details: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSessionSchema = new Schema<IExamSession>(
  {
    examId: { type: String, required: true, index: true },
    examName: String,
    studentId: { type: String, required: true, index: true },
    studentName: String,
    startedAt: Date,
    submittedAt: Date,
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'submitted', 'auto_submitted', 'terminated'],
      default: 'not_started',
      index: true,
    },
    score: Number,
    isPassed: Boolean,
    attemptsUsed: { type: Number, default: 0 },
    cheatEvents: [
      {
        type: String,
        timestamp: Date,
        details: String,
      },
    ],
  },
  { timestamps: true }
);

ExamSessionSchema.index({ examId: 1, studentId: 1 });
ExamSessionSchema.index({ studentId: 1, status: 1 });

export const ExamSession = mongoose.model<IExamSession>('ExamSession', ExamSessionSchema);
