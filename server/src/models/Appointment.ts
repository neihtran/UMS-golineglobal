import { Schema, model, Types } from 'mongoose';

export interface IAppointment extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  employeeName?: string;
  employeeCode?: string;
  title: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  fromDate: Date;
  toDate: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    employeeId: { type: Types.ObjectId, ref: 'User', required: true },
    employeeName: { type: String },
    employeeCode: { type: String },
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

AppointmentSchema.index({ employeeId: 1 });
AppointmentSchema.index({ fromDate: -1 });

export const Appointment = model<IAppointment>('Appointment', AppointmentSchema);
export type { IAppointment };
