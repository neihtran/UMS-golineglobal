import mongoose, { Schema, Document, Types } from 'mongoose';

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type LeaveType = 'annual' | 'sick' | 'unpaid' | 'maternity' | 'paternity' | 'other';

export interface ILeaveRequest extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId; // ref: VienChuc
  employeeName: string;
  department?: Types.ObjectId;
  departmentName?: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  days: number;
  status: LeaveRequestStatus;
  approver?: Types.ObjectId;
  approverName?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'VienChuc', required: true, index: true },
    employeeName: { type: String, required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    departmentName: { type: String },
    type: {
      type: String,
      enum: ['annual', 'sick', 'unpaid', 'maternity', 'paternity', 'other'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    days: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    approver: { type: Schema.Types.ObjectId, ref: 'VienChuc' },
    approverName: { type: String },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

LeaveRequestSchema.index({ employeeId: 1, status: 1 });
LeaveRequestSchema.index({ startDate: -1 });

export const LeaveRequest = mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
