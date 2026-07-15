import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInternship extends Document {
  _id: Types.ObjectId;
  student?: Types.ObjectId;
  studentCode: string;
  studentName: string;
  className?: string;
  major?: string;
  department?: Types.ObjectId;
  company: string;
  position: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  supervisor?: string;
  supervisorPhone?: string;
  supervisorEmail?: string;
  status: 'registered' | 'in_progress' | 'pending_report' | 'completed' | 'rejected';
  progress: number;
  reportSubmitted: boolean;
  grade?: number;
  description?: string;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InternshipSchema = new Schema<IInternship>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: false },
    studentCode: { type: String, required: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    className: { type: String, trim: true },
    major: { type: String, trim: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    company: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    supervisor: { type: String, trim: true },
    supervisorPhone: { type: String, trim: true },
    supervisorEmail: { type: String, trim: true, lowercase: true },
    status: {
      type: String,
      enum: ['registered', 'in_progress', 'pending_report', 'completed', 'rejected'],
      default: 'registered',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    reportSubmitted: { type: Boolean, default: false },
    grade: { type: Number, min: 0, max: 10 },
    description: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

InternshipSchema.index({ studentCode: 1 });
InternshipSchema.index({ status: 1, startDate: -1 });
InternshipSchema.index({ major: 1, status: 1 });

export const Internship = mongoose.model<IInternship>('Internship', InternshipSchema);