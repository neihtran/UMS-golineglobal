import { Schema, model, Types } from 'mongoose';

export interface IStaffAppointment extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  employeeName?: string;
  employeeCode?: string;
  type: string;
  title: string;
  decisionNo: string;
  decisionDate: Date;
  effectiveDate: Date;
  signer: string;
  status: string;
  statusVariant: 'success' | 'neutral' | 'warning' | 'error';
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StaffAppointmentSchema = new Schema<IStaffAppointment>({
  employeeId: { type: Types.ObjectId, ref: 'User', required: true },
  employeeName: { type: String },
  employeeCode: { type: String },
  type: { type: String, required: true },
  title: { type: String, required: true },
  decisionNo: { type: String, required: true },
  decisionDate: { type: Date, required: true },
  effectiveDate: { type: Date, required: true },
  signer: { type: String, required: true },
  status: { type: String, required: true },
  statusVariant: { type: String, enum: ['success', 'neutral', 'warning', 'error'], required: true },
  isCurrent: { type: Boolean, default: false },
});

StaffAppointmentSchema.index({ employeeId: 1, effectiveDate: -1 });

export const StaffAppointment = model<IStaffAppointment>('StaffAppointment', StaffAppointmentSchema);
export type { IStaffAppointment };
