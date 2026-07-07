import mongoose, { Schema, Document, Types } from 'mongoose';

export type AssignmentType = 'homework' | 'quiz' | 'exam' | 'project' | 'discussion' | 'essay';

export interface IAssignment extends Document {
  _id: Types.ObjectId;
  courseId: string;
  courseCode?: string;
  title: string;
  description?: string;
  type: AssignmentType;
  maxScore: number;
  dueDate?: Date;
  attachments: string[];
  allowLate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    courseId: { type: String, required: true, index: true },
    courseCode: String,
    title: { type: String, required: true, text: true },
    description: String,
    type: { type: String, enum: ['homework', 'quiz', 'exam', 'project', 'discussion', 'essay'], default: 'homework' },
    maxScore: { type: Number, positive: true, default: 100 },
    dueDate: Date,
    attachments: [{ type: String }],
    allowLate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AssignmentSchema.index({ courseId: 1, type: 1 });
AssignmentSchema.index({ dueDate: 1 });

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
