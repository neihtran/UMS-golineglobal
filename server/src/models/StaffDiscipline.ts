import { Schema, model, Types } from 'mongoose';

export interface IStaffDiscipline extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  employeeName?: string;
  employeeCode?: string;
  year: number;
  type: 'Khen thuong' | 'Ky luat';
  note: string;
  level: 'success' | 'warning' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

const StaffDisciplineSchema = new Schema<IStaffDiscipline>({
  employeeId: { type: Types.ObjectId, ref: 'User', required: true },
  employeeName: { type: String },
  employeeCode: { type: String },
  year: { type: Number, required: true },
  type: { type: String, enum: ['Khen thuong', 'Ky luat'], required: true },
  note: { type: String, required: true },
  level: { type: String, enum: ['success', 'warning', 'error'], required: true },
});

StaffDisciplineSchema.index({ employeeId: 1, year: -1 });

export const StaffDiscipline = model<IStaffDiscipline>('StaffDiscipline', StaffDisciplineSchema);
export type { IStaffDiscipline };
