import mongoose, { Schema, Document, Types } from 'mongoose';

export type ReportType = 'enrollment' | 'staff' | 'finance' | 'graduation' | 'research' | 'library' | 'custom';
export type ReportFormat = 'json' | 'csv' | 'pdf' | 'xlsx';

export interface IReport extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  type: ReportType;
  module?: string;
  params: Record<string, unknown>;
  format: ReportFormat;
  isPublic: boolean;
  schedule: 'on_demand' | 'daily' | 'weekly' | 'monthly' | 'semester';
  generatedAt?: Date;
  resultData?: Record<string, unknown>;
  generatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    name: { type: String, required: true, text: true },
    description: String,
    type: { type: String, enum: ['enrollment', 'staff', 'finance', 'graduation', 'research', 'library', 'custom'], required: true, index: true },
    module: String,
    params: { type: Schema.Types.Mixed, default: {} },
    format: { type: String, enum: ['json', 'csv', 'pdf', 'xlsx'], default: 'json' },
    isPublic: { type: Boolean, default: false },
    schedule: { type: String, enum: ['on_demand', 'daily', 'weekly', 'monthly', 'semester'], default: 'on_demand' },
    generatedAt: Date,
    resultData: { type: Schema.Types.Mixed },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ReportSchema.index({ type: 1, schedule: 1 });
ReportSchema.index({ isPublic: 1, createdAt: -1 });

export const Report = mongoose.model<IReport>('Report', ReportSchema);
