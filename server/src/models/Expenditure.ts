import mongoose, { Schema, Document, Types } from 'mongoose';

export type ExpenseCategory = 'personnel' | 'equipment' | 'infrastructure' | 'research' | 'training' | 'student_support' | 'administrative' | 'other';
export type ExpenditureStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';

export interface IExpenditure extends Document {
  _id: Types.ObjectId;
  name: string;
  category: ExpenseCategory;
  amount: number;
  department?: string;
  applicant?: string;
  approver?: string;
  reason?: string;
  status: ExpenditureStatus;
  requestDate?: Date;
  approveDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenditureSchema = new Schema<IExpenditure>(
  {
    name: { type: String, required: true, text: true },
    category: { type: String, enum: ['personnel', 'equipment', 'infrastructure', 'research', 'training', 'student_support', 'administrative', 'other'], default: 'administrative', index: true },
    amount: { type: Number, required: true, min: 0 },
    department: String,
    applicant: String,
    approver: String,
    reason: String,
    status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected', 'completed'], default: 'draft', index: true },
    requestDate: Date,
    approveDate: Date,
    notes: String,
  },
  { timestamps: true }
);

ExpenditureSchema.index({ status: 1, requestDate: -1 });
ExpenditureSchema.index({ department: 1, category: 1 });

export const Expenditure = mongoose.model<IExpenditure>('Expenditure', ExpenditureSchema);
