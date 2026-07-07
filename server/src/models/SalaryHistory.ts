import { Schema, model, Types } from 'mongoose';

export interface ISalaryHistory extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  employeeName?: string;
  employeeCode?: string;
  date: Date;
  baseSalary: number;
  allowance: number;
  insurance: number;
  netSalary: number;
  createdAt: Date;
  updatedAt: Date;
}

const SalaryHistorySchema = new Schema<ISalaryHistory>({
  employeeId: { type: Types.ObjectId, ref: 'User', required: true },
  employeeName: { type: String },
  employeeCode: { type: String },
  date: { type: Date, required: true },
  baseSalary: { type: Number, required: true, min: 0 },
  allowance: { type: Number, default: 0, min: 0 },
  insurance: { type: Number, default: 0, min: 0 },
  netSalary: { type: Number, required: true, min: 0 },
});

SalaryHistorySchema.index({ employeeId: 1, date: -1 });

export const SalaryHistory = model<ISalaryHistory>('SalaryHistory', SalaryHistorySchema);
export type { ISalaryHistory };
