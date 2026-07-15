import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── ScheduleChange (Thay đổi lịch) ──────────────────────────────────────────
// Lưu lịch sử thay đổi lịch học

export interface IScheduleChange extends Document {
  _id: Types.ObjectId;
  schedule: Types.ObjectId;           // Ref: ClassSchedule
  changeType: 'room' | 'lecturer' | 'time' | 'cancel' | 'add';
  // Room change
  oldRoom?: Types.ObjectId;
  newRoom?: Types.ObjectId;
  // Lecturer change
  oldLecturer?: Types.ObjectId;
  newLecturer?: Types.ObjectId;
  // Time change
  oldDayOfWeek?: number;
  newDayOfWeek?: number;
  oldLessonFrom?: number;
  newLessonFrom?: number;
  oldLessonTo?: number;
  newLessonTo?: number;
  oldDate?: Date;
  newDate?: Date;
  // Status & metadata
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  note?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleChangeSchema = new Schema<IScheduleChange>(
  {
    schedule: {
      type: Schema.Types.ObjectId,
      ref: 'ClassSchedule',
      required: true,
      index: true,
    },
    changeType: {
      type: String,
      enum: ['room', 'lecturer', 'time', 'cancel', 'add'],
      required: true,
    },
    // Room change
    oldRoom: { type: Schema.Types.ObjectId, ref: 'Department' },
    newRoom: { type: Schema.Types.ObjectId, ref: 'Department' },
    // Lecturer change
    oldLecturer: { type: Schema.Types.ObjectId, ref: 'VienChuc' },
    newLecturer: { type: Schema.Types.ObjectId, ref: 'VienChuc' },
    // Time change
    oldDayOfWeek: Number,
    newDayOfWeek: Number,
    oldLessonFrom: Number,
    newLessonFrom: Number,
    oldLessonTo: Number,
    newLessonTo: Number,
    oldDate: Date,
    newDate: Date,
    // Status & metadata
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    note: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes
ScheduleChangeSchema.index({ schedule: 1, status: 1 });
ScheduleChangeSchema.index({ createdBy: 1, status: 1 });

export const ScheduleChange = mongoose.model<IScheduleChange>('ScheduleChange', ScheduleChangeSchema);
