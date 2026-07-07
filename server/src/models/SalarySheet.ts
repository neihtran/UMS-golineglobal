import { Schema, model, Types } from 'mongoose';

export interface ISalarySheet extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  employeeName?: string;
  employeeCode?: string;
  department?: string;
  month: string; // "YYYY-MM"
  baseSalary: number;
  allowances: number;
  deductions: number;
  bonus: number;
  netSalary: number;
  status: 'draft' | 'submitted' | 'approved' | 'paid';
  approvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SalarySheetSchema = new Schema<ISalarySheet>(
  {
    employeeId: { type: Types.ObjectId, ref: 'User', required: true },
    employeeName: { type: String },
    employeeCode: { type: String },
    department: { type: String },
    month: { type: String, required: true },
    baseSalary: { type: Number, required: true, min: 0 },
    allowances: { type: Number, default: 0, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    bonus: { type: Number, default: 0, min: 0 },
    netSalary: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['draft', 'submitted', 'approved', 'paid'], default: 'draft' },
    approvedBy: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

SalarySheetSchema.index({ month: 1, employeeId: 1 }, { unique: true });
SalarySheetSchema.index({ status: 1 });

export const SalarySheet = model<ISalarySheet>('SalarySheet', SalarySheetSchema);
export type { ISalarySheet };
