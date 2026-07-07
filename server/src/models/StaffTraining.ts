import { Schema, model, Types } from 'mongoose';

export interface IStaffTraining extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  employeeName?: string;
  employeeCode?: string;
  name: string;
  organization: string;
  year: number;
  certificate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StaffTrainingSchema = new Schema<IStaffTraining>({
  employeeId: { type: Types.ObjectId, ref: 'User', required: true },
  employeeName: { type: String },
  employeeCode: { type: String },
  name: { type: String, required: true },
  organization: { type: String, required: true },
  year: { type: Number, required: true },
  certificate: { type: String },
});

StaffTrainingSchema.index({ employeeId: 1, year: -1 });

export const StaffTraining = model<IStaffTraining>('StaffTraining', StaffTrainingSchema);
export type { IStaffTraining };
