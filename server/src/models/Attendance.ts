import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: string;
  courseId: string;
  courseCode?: string;
  sessionDate: Date;
  sessionType: 'lecture' | 'practice' | 'seminar' | 'online';
  isPresent: boolean;
  isExcused: boolean;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    studentId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    courseCode: String,
    sessionDate: { type: Date, required: true, index: true },
    sessionType: { type: String, enum: ['lecture', 'practice', 'seminar', 'online'], default: 'lecture' },
    isPresent: { type: Boolean, default: false },
    isExcused: { type: Boolean, default: false },
    note: String,
  },
  { timestamps: true }
);

AttendanceSchema.index({ studentId: 1, courseId: 1, sessionDate: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
