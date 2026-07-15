import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── StudentReservation (Bảo lưu) ─────────────────────────────────────────────
// Quản lý chi tiết các đợt bảo lưu

export interface IStudentReservation extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;             // Ref: Student
  fromDate: Date;                     // Từ ngày
  toDate: Date;                       // Đến ngày
  semesterFrom?: Types.ObjectId;      // Ref: AcademicTerm (học kỳ bắt đầu bảo lưu)
  semesterTo?: Types.ObjectId;         // Ref: AcademicTerm (học kỳ kết thúc bảo lưu)
  decisionNo?: string;                // Số quyết định
  decisionDate?: Date;                // Ngày quyết định
  reason?: string;
  status: 'pending' | 'approved' | 'cancelled';
  approvedBy?: Types.ObjectId;         // Ref: User
  approvedAt?: Date;
  note?: string;
  createdBy: Types.ObjectId;          // Ref: User
  createdAt: Date;
  updatedAt: Date;
}

const StudentReservationSchema = new Schema<IStudentReservation>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    semesterFrom: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicTerm',
    },
    semesterTo: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicTerm',
    },
    decisionNo: {
      type: String,
      trim: true,
    },
    decisionDate: Date,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'cancelled'],
      default: 'pending',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
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
StudentReservationSchema.index({ student: 1, status: 1 });
StudentReservationSchema.index({ semesterFrom: 1, semesterTo: 1 });

export const StudentReservation = mongoose.model<IStudentReservation>('StudentReservation', StudentReservationSchema);
