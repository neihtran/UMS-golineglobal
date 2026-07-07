import { Schema, model, Types } from 'mongoose';

export interface IDiscipline extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  employeeName?: string;
  employeeCode?: string;
  type: 'warning' | 'reprimand' | 'demotion' | 'dismissal';
  reason: string;
  description?: string;
  date: Date;
  decisionNo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DisciplineSchema = new Schema<IDiscipline>(
  {
    employeeId: { type: Types.ObjectId, ref: 'User', required: true },
    employeeName: { type: String },
    employeeCode: { type: String },
    type: { type: String, enum: ['warning', 'reprimand', 'demotion', 'dismissal'], required: true },
    reason: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    decisionNo: { type: String },
  },
  { timestamps: true }
);

DisciplineSchema.index({ employeeId: 1 });
DisciplineSchema.index({ type: 1 });
DisciplineSchema.index({ date: -1 });

export const Discipline = model<IDiscipline>('Discipline', DisciplineSchema);
export type { IDiscipline };
