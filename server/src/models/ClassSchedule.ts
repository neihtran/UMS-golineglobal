import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── ClassSchedule (Lịch học) ─────────────────────────────────────────────────
// Quản lý thời khóa biểu của lớp học phần

export interface IClassSchedule extends Document {
  _id: Types.ObjectId;
  course: Types.ObjectId;             // Ref: Course (lớp học phần)
  lecturer: Types.ObjectId;           // Ref: VienChuc (giảng viên)
  room?: Types.ObjectId;            // Ref: Room (phòng học)
  dayOfWeek: number;                // Thứ trong tuần (1=CN, 2=T2, ..., 7=T7)
  lessonFrom: number;                // Tiết bắt đầu (1-10)
  lessonTo: number;                  // Tiết kết thúc (1-10)
  startDate?: Date;
  endDate?: Date;
  note?: string;                     // Ghi chú (VD: "Tuần lẻ", "Tuần chẵn")
  isActive: boolean;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClassScheduleSchema = new Schema<IClassSchedule>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    lecturer: {
      type: Schema.Types.ObjectId,
      ref: 'VienChuc',
      required: true,
      index: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Department', // Using Department as placeholder for Room
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
      index: true,
    },
    lessonFrom: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    lessonTo: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    startDate: Date,
    endDate: Date,
    note: String,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Indexes
ClassScheduleSchema.index({ course: 1, isActive: 1 });
ClassScheduleSchema.index({ lecturer: 1, isActive: 1 });
ClassScheduleSchema.index({ room: 1, isActive: 1 });
// Compound index for conflict checking: same day, overlapping lessons
ClassScheduleSchema.index({ dayOfWeek: 1, lessonFrom: 1, lessonTo: 1, room: 1 }, { sparse: true });

export const ClassSchedule = mongoose.model<IClassSchedule>('ClassSchedule', ClassScheduleSchema);
