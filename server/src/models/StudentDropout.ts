import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── StudentDropout (Thôi học) ────────────────────────────────────────────────
// Quản lý chi tiết thôi học

export type DropoutType = 'voluntary' | 'academic' | 'disciplinary' | 'other';

export interface IStudentDropout extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;             // Ref: Student
  dropoutDate: Date;                  // Ngày thôi học
  decisionNo?: string;                // Số quyết định
  decisionDate?: Date;                // Ngày quyết định
  reason?: string;
  dropoutType: DropoutType;           // Loại thôi học
  status: 'pending' | 'approved' | 'cancelled';
  approvedBy?: Types.ObjectId;         // Ref: User
  approvedAt?: Date;
  refundAmount?: number;             // Số tiền hoàn trả (nếu có)
  note?: string;
  createdBy: Types.ObjectId;          // Ref: User
  createdAt: Date;
  updatedAt: Date;
}

const StudentDropoutSchema = new Schema<IStudentDropout>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    dropoutDate: {
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
    dropoutType: {
      type: String,
      enum: ['voluntary', 'academic', 'disciplinary', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'cancelled'],
      default: 'pending',
      index: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    refundAmount: {
      type: Number,
      min: 0,
    },
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
StudentDropoutSchema.index({ student: 1, status: 1 });
StudentDropoutSchema.index({ dropoutType: 1, status: 1 });

export const StudentDropout = mongoose.model<IStudentDropout>('StudentDropout', StudentDropoutSchema);
