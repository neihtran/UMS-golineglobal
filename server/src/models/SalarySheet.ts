import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── SalarySheet Interface ──────────────────────────────────────────────────
export interface ISalarySheet extends Document {
  _id: Types.ObjectId;
  month: number;
  year: number;
  department?: Types.ObjectId;
  items: Array<{
    employee: Types.ObjectId;
    baseSalary: number;
    allowance: number;
    bonus: number;
    deduction: number;
    insurance: number;
    tax: number;
    netSalary: number;
  }>;
  totalAmount: number;
  totalEmployees: number;
  status: 'draft' | 'pending' | 'approved' | 'paid' | 'cancelled';
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  paidAt?: Date;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SalarySheetSchema = new Schema<ISalarySheet>(
  {
    month: { type: Number, required: true, min: 1, max: 12, index: true },
    year: { type: Number, required: true, min: 2000, max: 2100, index: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    items: [{
      employee: { type: Schema.Types.ObjectId, ref: 'VienChuc', required: true },
      baseSalary: { type: Number, default: 0 },
      allowance: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
      deduction: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      netSalary: { type: Number, default: 0 },
    }],
    totalAmount: { type: Number, default: 0 },
    totalEmployees: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'paid', 'cancelled'],
      default: 'draft',
      index: true,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    paidAt: Date,
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

SalarySheetSchema.index({ year: 1, month: 1, department: 1 }, { unique: false });

export const SalarySheet = mongoose.model<ISalarySheet>('SalarySheet', SalarySheetSchema);