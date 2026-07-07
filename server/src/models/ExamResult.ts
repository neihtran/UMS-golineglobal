import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IExamResult extends Document {
  _id: Types.ObjectId;
  examId: string;
  examName?: string;
  examType?: string;
  studentId: string;
  studentName?: string;
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  answers: Array<{
    questionId: string;
    selectedOption?: string;
    isCorrect: boolean;
    scoreEarned: number;
  }>;
  submittedAt: Date;
  gradedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExamResultSchema = new Schema<IExamResult>(
  {
    examId: { type: String, required: true, index: true },
    examName: String,
    examType: String,
    studentId: { type: String, required: true, index: true },
    studentName: String,
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 1, default: 100 },
    percentage: { type: Number, min: 0, max: 100 },
    isPassed: { type: Boolean, default: false },
    answers: [
      {
        questionId: { type: String, required: true },
        selectedOption: String,
        isCorrect: { type: Boolean, default: false },
        scoreEarned: { type: Number, default: 0 },
      },
    ],
    submittedAt: { type: Date, default: Date.now },
    gradedAt: Date,
  },
  { timestamps: true }
);

ExamResultSchema.index({ examId: 1, studentId: 1 });
ExamResultSchema.index({ studentId: 1, score: -1 });

export const ExamResult = mongoose.model<IExamResult>('ExamResult', ExamResultSchema);
