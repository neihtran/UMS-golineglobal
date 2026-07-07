import { Schema, model, Types } from 'mongoose';

export interface IContractHistory extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  employeeName?: string;
  employeeCode?: string;
  year: number;
  type: string;
  note?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContractHistorySchema = new Schema<IContractHistory>({
  employeeId: { type: Types.ObjectId, ref: 'User', required: true },
  employeeName: { type: String },
  employeeCode: { type: String },
  year: { type: Number, required: true },
  type: { type: String, required: true },
  note: { type: String },
  status: { type: String, required: true },
});

ContractHistorySchema.index({ employeeId: 1, year: -1 });

export const ContractHistory = model<IContractHistory>('ContractHistory', ContractHistorySchema);
export type { IContractHistory };
