import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITuition extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  semester: number;
  academicYear: string;
  amount: number;
  paidAmount: number;
  status: 'unpaid' | 'partial' | 'paid' | 'exempt' | 'deferred';
  dueDate: Date;
  paidAt?: Date;
  paymentMethod?: string;
  transactionCode?: string;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TuitionSchema = new Schema<ITuition>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    semester: { type: Number, required: true, min: 1, max: 12 },
    academicYear: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'exempt', 'deferred'],
      default: 'unpaid',
    },
    dueDate: { type: Date, required: true },
    paidAt: Date,
    paymentMethod: String,
    transactionCode: String,
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

TuitionSchema.index({ semester: 1, academicYear: 1, status: 1 });
TuitionSchema.index({ student: 1, semester: 1, academicYear: 1 }, { unique: true });

export const Tuition = mongoose.model<ITuition>('Tuition', TuitionSchema);

export interface IExpense extends Document {
  _id: Types.ObjectId;
  code: string;
  description: string;
  category: string;
  amount: number;
  date: Date;
  vendor?: string;
  department?: Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  receiptUrl?: string;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    vendor: String,
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid'],
      default: 'pending',
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    receiptUrl: String,
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ExpenseSchema.index({ status: 1, category: 1, date: -1 });

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);

export interface IBudget extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  year: number;
  department?: Types.ObjectId;
  totalBudget: number;
  allocated: number;
  spent: number;
  remaining: number;
  status: 'draft' | 'active' | 'closed';
  items: Array<{ category: string; allocated: number; spent: number }>;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 2000 },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    totalBudget: { type: Number, required: true, min: 0 },
    allocated: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' },
    items: [{
      category: String,
      allocated: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
    }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

BudgetSchema.index({ year: 1, department: 1 });

export const Budget = mongoose.model<IBudget>('Budget', BudgetSchema);