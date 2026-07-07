import mongoose, { Schema, Document, Types } from 'mongoose';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export interface IProject extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  description?: string;
  manager?: string;
  managerName?: string;
  department?: string;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  progress: number;
  color: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    code: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true, text: true },
    description: String,
    manager: String,
    managerName: String,
    department: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'], default: 'active', index: true },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    color: { type: String, default: '#3b82f6' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

ProjectSchema.index({ status: 1, startDate: -1 });
ProjectSchema.index({ name: 'text' });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
