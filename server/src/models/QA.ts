import mongoose, { Schema, Document, Types } from 'mongoose';

export type EvidenceStatus = 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'archived';
export type AssessmentType = 'internal' | 'external' | 'self_assessment';

export interface IEvidence extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  standardCode: string;
  criteria: string[];
  documentUrls: string[];
  status: EvidenceStatus;
  submittedBy?: string;
  submittedAt?: Date;
  reviewedBy?: string;
  reviewComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema = new Schema<IEvidence>(
  {
    title: { type: String, required: true, text: true },
    description: String,
    standardCode: { type: String, required: true, index: true },
    criteria: [{ type: String }],
    documentUrls: [{ type: String }],
    status: { type: String, enum: ['draft', 'submitted', 'reviewing', 'approved', 'rejected', 'archived'], default: 'draft', index: true },
    submittedBy: String,
    submittedAt: Date,
    reviewedBy: String,
    reviewComment: String,
  },
  { timestamps: true }
);

EvidenceSchema.index({ standardCode: 1, status: 1 });
EvidenceSchema.index({ submittedBy: 1 });

export const Evidence = mongoose.model<IEvidence>('Evidence', EvidenceSchema);

export interface IAssessment extends Document {
  _id: Types.ObjectId;
  title: string;
  type: AssessmentType;
  standardCode: string;
  assessors: string[];
  targetDepartment?: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'completed' | 'archived';
  criteria: Array<{
    code: string;
    description: string;
    weight: number;
  }>;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSchema = new Schema<IAssessment>(
  {
    title: { type: String, required: true, text: true },
    type: { type: String, enum: ['internal', 'external', 'self_assessment'], required: true, index: true },
    standardCode: { type: String, required: true, index: true },
    assessors: [{ type: String }],
    targetDepartment: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['planning', 'active', 'completed', 'archived'], default: 'planning', index: true },
    criteria: [
      {
        code: { type: String, required: true },
        description: String,
        weight: { type: Number, min: 0, max: 100 },
      },
    ],
    note: String,
  },
  { timestamps: true }
);

AssessmentSchema.index({ standardCode: 1, status: 1 });

export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);
