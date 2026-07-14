import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── LeaveRequest Interface ─────────────────────────────────────────────────
export interface ILeaveRequest extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  employeeName: string;
  department?: Types.ObjectId;
  type: 'annual' | 'sick' | 'unpaid' | 'maternity' | 'paternity' | 'other';
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approver?: Types.ObjectId;
  approverName?: string;
  approvedAt?: Date;
  approvalNote?: string;
  days: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── LeaveRequest Schema ────────────────────────────────────────────────────
const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    type: {
      type: String,
      enum: ['annual', 'sick', 'unpaid', 'maternity', 'paternity', 'other'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approverName: String,
    approvedAt: Date,
    approvalNote: String,
    days: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
LeaveRequestSchema.index({ employeeId: 1, status: 1 });
LeaveRequestSchema.index({ status: 1, startDate: 1 });

export const LeaveRequest = mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
