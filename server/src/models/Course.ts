import mongoose, { Schema, Document, Types } from 'mongoose';

export type CourseLevel = 'basic' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published' | 'archived';

export interface ICourse extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  description?: string;
  instructor?: string;
  instructorName?: string;
  department?: Types.ObjectId;
  departmentName?: string;
  credits: number;
  durationHours?: number;
  level: CourseLevel;
  status: CourseStatus;
  thumbnail?: string;
  tags: string[];
  enrolledCount: number;
  maxEnrollment?: number;
  rating: number;
  startDate?: Date;
  endDate?: Date;
  syllabus?: string;
  prerequisites: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    code: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true, text: true },
    description: String,
    instructor: String,
    instructorName: String,
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    departmentName: String,
    credits: { type: Number, required: true, min: 1, max: 10, default: 3 },
    durationHours: Number,
    level: { type: String, enum: ['basic', 'intermediate', 'advanced'], default: 'intermediate' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    thumbnail: String,
    tags: [{ type: String }],
    enrolledCount: { type: Number, default: 0 },
    maxEnrollment: Number,
    rating: { type: Number, min: 0, max: 5, default: 0 },
    startDate: Date,
    endDate: Date,
    syllabus: String,
    prerequisites: [{ type: String }],
  },
  { timestamps: true }
);

CourseSchema.index({ status: 1, department: 1 });
CourseSchema.index({ instructor: 1 });
CourseSchema.index({ name: 'text', code: 'text' });

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
