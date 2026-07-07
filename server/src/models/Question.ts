import mongoose, { Schema, Document, Types } from 'mongoose';

export type QuestionType = 'single_choice' | 'multiple_choice' | 'essay' | 'true_false' | 'fill_blank';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface IQuestion extends Document {
  _id: Types.ObjectId;
  examId?: string;
  subjectId?: string;
  subjectName?: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  content: string;
  options: Array<{
    label: string;
    content: string;
    isCorrect: boolean;
  }>;
  correctAnswer?: string;
  explanation?: string;
  points: number;
  tags: string[];
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    examId: { type: String, index: true },
    subjectId: { type: String, index: true },
    subjectName: String,
    type: { type: String, enum: ['single_choice', 'multiple_choice', 'essay', 'true_false', 'fill_blank'], default: 'single_choice' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium', index: true },
    content: { type: String, required: true, text: true },
    options: [
      {
        label: String,
        content: { type: String, required: true },
        isCorrect: { type: Boolean, default: false },
      },
    ],
    correctAnswer: String,
    explanation: String,
    points: { type: Number, positive: true, default: 1 },
    tags: [{ type: String }],
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

QuestionSchema.index({ subjectId: 1, difficulty: 1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ content: 'text' });

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);
