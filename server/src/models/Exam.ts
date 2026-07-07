import mongoose, { Schema, Document, Types } from 'mongoose';

export type ExamStatus = 'draft' | 'published' | 'ongoing' | 'finished' | 'graded';
export type ExamType = 'midterm' | 'final' | 'quiz' | 'practice' | 'remake';

export interface IExam extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  type: ExamType;
  status: ExamStatus;
  subjectId?: string;
  subjectName?: string;
  department?: string;
  instructor?: string;
  startTime?: Date;
  endTime?: Date;
  durationMinutes: number;
  totalQuestions?: number;
  totalScore: number;
  passScore: number;
  allowedAttempts: number;
  shuffleQuestions: boolean;
  showResult: boolean;
  allowReview: boolean;
  plagiarismCheck: boolean;
  eyeTracking: boolean;
  lockBrowser: boolean;
  description?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExam>(
  {
    code: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true, text: true },
    type: { type: String, enum: ['midterm', 'final', 'quiz', 'practice', 'remake'], default: 'quiz', index: true },
    status: { type: String, enum: ['draft', 'published', 'ongoing', 'finished', 'graded'], default: 'draft', index: true },
    subjectId: String,
    subjectName: String,
    department: String,
    instructor: String,
    startTime: Date,
    endTime: Date,
    durationMinutes: { type: Number, positive: true, default: 60 },
    totalQuestions: Number,
    totalScore: { type: Number, positive: true, default: 100 },
    passScore: { type: Number, default: 50 },
    allowedAttempts: { type: Number, min: 1, default: 1 },
    shuffleQuestions: { type: Boolean, default: true },
    showResult: { type: Boolean, default: true },
    allowReview: { type: Boolean, default: true },
    plagiarismCheck: { type: Boolean, default: false },
    eyeTracking: { type: Boolean, default: false },
    lockBrowser: { type: Boolean, default: true },
    description: String,
    tags: [{ type: String }],
  },
  { timestamps: true }
);

ExamSchema.index({ status: 1, startTime: -1 });
ExamSchema.index({ subjectId: 1, type: 1 });
ExamSchema.index({ instructor: 1 });

export const Exam = mongoose.model<IExam>('Exam', ExamSchema);
