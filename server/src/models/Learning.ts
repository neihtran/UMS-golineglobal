import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAssignment extends Document {
  _id: Types.ObjectId;
  course: Types.ObjectId;
  title: string;
  description?: string;
  type: 'individual' | 'group' | 'quiz' | 'project';
  maxScore: number;
  weight: number;
  dueDate: Date;
  openDate?: Date;
  allowLateSubmission: boolean;
  maxLateDays?: number;
  attachments?: string[];
  allowResubmit: boolean;
  maxResubmitCount?: number;
  status: 'draft' | 'published' | 'closed' | 'graded';
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true, text: true },
    description: String,
    type: { type: String, enum: ['individual', 'group', 'quiz', 'project'], default: 'individual' },
    maxScore: { type: Number, default: 10, min: 0 },
    weight: { type: Number, default: 1, min: 0 },
    dueDate: { type: Date, required: true },
    openDate: Date,
    allowLateSubmission: { type: Boolean, default: false },
    maxLateDays: Number,
    attachments: [String],
    allowResubmit: { type: Boolean, default: false },
    maxResubmitCount: Number,
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'graded'],
      default: 'draft',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

AssignmentSchema.index({ course: 1, status: 1, dueDate: 1 });

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);

export interface ISubmission extends Document {
  _id: Types.ObjectId;
  assignment: Types.ObjectId;
  student: Types.ObjectId;
  content?: string;
  fileUrls?: string[];
  score?: number;
  grade?: string;
  feedback?: string;
  status: 'submitted' | 'late' | 'graded' | 'returned';
  submittedAt: Date;
  gradedAt?: Date;
  gradedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    content: String,
    fileUrls: [String],
    score: { type: Number, min: 0 },
    grade: String,
    feedback: String,
    status: {
      type: String,
      enum: ['submitted', 'late', 'graded', 'returned'],
      default: 'submitted',
    },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: Date,
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

SubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
SubmissionSchema.index({ student: 1, status: 1 });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);