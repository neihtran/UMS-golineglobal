import mongoose, { Schema, Document, Types } from 'mongoose';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  projectId?: string;
  projectName?: string;
  assignee?: string;
  assigneeName?: string;
  reporter?: string;
  reporterName?: string;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
  dueDate?: Date;
  startDate?: Date;
  progress: number;
  estimatedHours?: number;
  actualHours?: number;
  parentId?: Types.ObjectId;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, text: true },
    description: String,
    projectId: String,
    projectName: String,
    assignee: String,
    assigneeName: String,
    reporter: String,
    reporterName: String,
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium', index: true },
    status: { type: String, enum: ['todo', 'in_progress', 'review', 'done', 'cancelled'], default: 'todo', index: true },
    tags: [{ type: String }],
    dueDate: Date,
    startDate: Date,
    progress: { type: Number, min: 0, max: 100, default: 0 },
    estimatedHours: Number,
    actualHours: Number,
    parentId: { type: Schema.Types.ObjectId },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

TaskSchema.index({ status: 1, priority: 1 });
TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ assignee: 1, dueDate: 1 });
TaskSchema.index({ title: 'text' });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
