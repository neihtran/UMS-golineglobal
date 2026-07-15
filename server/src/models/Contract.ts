import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Contract Interface ─────────────────────────────────────────────────────
export interface IContract extends Document {
  _id: Types.ObjectId;
  code: string;
  employee: Types.ObjectId; // VienChuc
  type: 'Cơ hữu' | 'Thỉnh giảng' | 'Thử việc' | 'Cộng tác viên';
  startDate: Date;
  endDate?: Date;
  salary: number;
  status: 'active' | 'expired' | 'terminated' | 'pending';
  signedAt?: Date;
  signedBy?: Types.ObjectId;
  fileUrl?: string;
  notes?: string;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    employee: { type: Schema.Types.ObjectId, ref: 'VienChuc', required: true },
    type: {
      type: String,
      enum: ['Cơ hữu', 'Thỉnh giảng', 'Thử việc', 'Cộng tác viên'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: Date,
    salary: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['active', 'expired', 'terminated', 'pending'],
      default: 'active',
    },
    signedAt: Date,
    signedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    fileUrl: String,
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ContractSchema.index({ employee: 1, status: 1 });
ContractSchema.index({ endDate: 1, status: 1 });

export const Contract = mongoose.model<IContract>('Contract', ContractSchema);