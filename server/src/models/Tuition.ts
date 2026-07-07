import mongoose, { Schema, Document } from 'mongoose';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overdue' | 'refunded' | 'waived';

export interface ITuition extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: string;
  studentName?: string;
  semester: string;
  academicYear: string;
  amount: number;
  paidAmount: number;
  status: PaymentStatus;
  paymentMethod?: string;
  paidAt?: Date;
  dueDate?: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TuitionSchema = new Schema<ITuition>(
  {
    studentId: { type: String, required: true, index: true },
    studentName: String,
    semester: { type: String, required: true, index: true },
    academicYear: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'overdue', 'refunded', 'waived'],
      default: 'unpaid',
      index: true,
    },
    paymentMethod: String,
    paidAt: Date,
    dueDate: Date,
    note: String,
  },
  { timestamps: true }
);

TuitionSchema.index({ studentId: 1, academicYear: 1 });
TuitionSchema.index({ status: 1, dueDate: 1 });

export const Tuition = mongoose.model<ITuition>('Tuition', TuitionSchema);
