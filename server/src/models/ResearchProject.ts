import mongoose, { Schema, Document, Types } from 'mongoose';

export type ProjectStatusRit = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectTypeRit = 'research' | 'application' | 'international' | 'tech_transfer';

export interface IResearchProject extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  type: ProjectTypeRit;
  status: ProjectStatusRit;
  principal?: string;
  principalName?: string;
  members: string[];
  department?: string;
  startDate?: Date;
  endDate?: Date;
  funding?: number;
  fundingUnit?: string;
  result?: string;
  description?: string;
  publications: Array<{
    title: string;
    journal?: string;
    year?: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ResearchProjectSchema = new Schema<IResearchProject>(
  {
    code: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true, text: true },
    type: { type: String, enum: ['research', 'application', 'international', 'tech_transfer'], default: 'research', index: true },
    status: { type: String, enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'], default: 'planning', index: true },
    principal: String,
    principalName: String,
    members: [{ type: String }],
    department: String,
    startDate: Date,
    endDate: Date,
    funding: Number,
    fundingUnit: String,
    result: String,
    description: String,
    publications: [
      {
        title: String,
        journal: String,
        year: Number,
      },
    ],
  },
  { timestamps: true }
);

ResearchProjectSchema.index({ status: 1, type: 1 });
ResearchProjectSchema.index({ principal: 1 });
ResearchProjectSchema.index({ name: 'text', code: 'text' });

export const ResearchProject = mongoose.model<IResearchProject>('ResearchProject', ResearchProjectSchema);
