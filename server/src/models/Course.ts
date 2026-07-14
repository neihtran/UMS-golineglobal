import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICourse extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  subject: Types.ObjectId;
  semester: number;
  academicYear: string;
  lecturer?: Types.ObjectId;
  department?: Types.ObjectId;
  schedule?: string;
  room?: string;
  maxStudents: number;
  enrolledCount: number;
  status: 'draft' | 'open' | 'closed' | 'cancelled' | 'completed';
  startDate?: Date;
  endDate?: Date;
  description?: string;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true, text: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    semester: { type: Number, required: true, min: 1, max: 12 },
    academicYear: { type: String, required: true },
    lecturer: { type: Schema.Types.ObjectId, ref: 'VienChuc', index: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    schedule: String,
    room: String,
    maxStudents: { type: Number, default: 50, min: 1 },
    enrolledCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'open', 'closed', 'cancelled', 'completed'],
      default: 'draft',
      index: true,
    },
    startDate: Date,
    endDate: Date,
    description: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

CourseSchema.index({ semester: 1, academicYear: 1 });
CourseSchema.index({ status: 1, lecturer: 1 });

export const Course = mongoose.model<ICourse>('Course', CourseSchema);