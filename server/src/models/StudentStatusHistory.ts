import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── StudentStatusHistory (Lịch sử trạng thái) ───────────────────────────────
// Lưu toàn bộ lịch sử thay đổi trạng thái sinh viên

export type StudentStatus = 'studying' | 'reserved' | 'graduated' | 'dropped' | 'transferred_major' | 'transferred_class';

export interface IStudentStatusHistory extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;             // Ref: Student
  status: StudentStatus;
  effectiveDate: Date;                // Ngày hiệu lực
  decisionNo?: string;                // Số quyết định
  decisionDate?: Date;                // Ngày quyết định
  reason?: string;
  note?: string;
  previousStatus?: StudentStatus;     // Trạng thái trước đó
  createdBy: Types.ObjectId;          // Ref: User
  createdAt: Date;
  updatedAt: Date;
}

const StudentStatusHistorySchema = new Schema<IStudentStatusHistory>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['studying', 'reserved', 'graduated', 'dropped', 'transferred_major', 'transferred_class'],
      required: true,
      index: true,
    },
    effectiveDate: {
      type: Date,
      required: true,
      index: true,
    },
    decisionNo: {
      type: String,
      trim: true,
    },
    decisionDate: Date,
    reason: String,
    note: String,
    previousStatus: {
      type: String,
      enum: ['studying', 'reserved', 'graduated', 'dropped', 'transferred_major', 'transferred_class'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes
StudentStatusHistorySchema.index({ student: 1, effectiveDate: -1 });
StudentStatusHistorySchema.index({ student: 1, status: 1 });

export const StudentStatusHistory = mongoose.model<IStudentStatusHistory>('StudentStatusHistory', StudentStatusHistorySchema);
