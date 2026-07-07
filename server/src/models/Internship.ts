import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInternship extends Document {
  _id: Types.ObjectId;
  studentId: string;
  studentName?: string;
  companyName: string;
  companyAddress?: string;
  position?: string;
  mentorName?: string;
  mentorPhone?: string;
  startDate: Date;
  endDate: Date;
  status: 'registered' | 'in_progress' | 'completed' | 'failed';
  reportUrl?: string;
  grade?: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InternshipSchema = new Schema<IInternship>(
  {
    studentId: { type: String, required: true, index: true },
    studentName: String,
    companyName: { type: String, required: true },
    companyAddress: String,
    position: String,
    mentorName: String,
    mentorPhone: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['registered', 'in_progress', 'completed', 'failed'],
      default: 'registered',
      index: true,
    },
    reportUrl: String,
    grade: { type: Number, min: 0, max: 10 },
    note: String,
  },
  { timestamps: true }
);

InternshipSchema.index({ studentId: 1, status: 1 });
InternshipSchema.index({ companyName: 'text' });

export const Internship = mongoose.model<IInternship>('Internship', InternshipSchema);
