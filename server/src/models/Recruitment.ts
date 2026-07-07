import { Schema, model, Types } from 'mongoose';

export interface IRecruitment extends Document {
  _id: Types.ObjectId;
  code: string;
  title: string;
  description?: string;
  department: Types.ObjectId;
  departmentName?: string;
  position: string;
  level: string;
  slots: number;
  applicants: number;
  deadline: Date;
  status: 'draft' | 'open' | 'closed' | 'completed' | 'cancelled';
  method: string;
  requirements?: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RecruitmentSchema = new Schema<IRecruitment>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    department: { type: Types.ObjectId, ref: 'Department', required: true },
    departmentName: { type: String },
    position: { type: String, required: true, trim: true },
    level: { type: String, required: true, trim: true },
    slots: { type: Number, required: true, min: 1 },
    applicants: { type: Number, default: 0, min: 0 },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ['draft', 'open', 'closed', 'completed', 'cancelled'], default: 'draft' },
    method: { type: String, required: true, trim: true },
    requirements: { type: String },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

RecruitmentSchema.index({ code: 1 });
RecruitmentSchema.index({ status: 1 });
RecruitmentSchema.index({ department: 1 });

export const Recruitment = model<IRecruitment>('Recruitment', RecruitmentSchema);
