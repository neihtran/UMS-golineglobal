import mongoose, { Schema, Document, Types } from 'mongoose';

export type CompetencyCategory = 'digital_competence' | 'teaching_competence' | 'research_competence' | 'leadership_competence';
export type CompetencyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface ICompetency extends Document {
  _id: Types.ObjectId;
  name: string;
  category: CompetencyCategory;
  description?: string;
  indicators: string[];
  levels: Array<{
    level: CompetencyLevel;
    description: string;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompetencySchema = new Schema<ICompetency>(
  {
    name: { type: String, required: true, text: true },
    category: { type: String, enum: ['digital_competence', 'teaching_competence', 'research_competence', 'leadership_competence'], required: true, index: true },
    description: String,
    indicators: [{ type: String }],
    levels: [
      {
        level: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], required: true },
        description: { type: String, required: true },
      },
    ],
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

CompetencySchema.index({ category: 1, isActive: 1 });
CompetencySchema.index({ name: 'text' });

export const Competency = mongoose.model<ICompetency>('Competency', CompetencySchema);

export interface ICompetencyAssessment extends Document {
  _id: Types.ObjectId;
  personId: string;
  personName?: string;
  competencyId: string;
  assessor?: string;
  selfLevel?: CompetencyLevel;
  assessedLevel?: CompetencyLevel;
  score?: number;
  comment?: string;
  evidenceUrls: string[];
  assessedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CompetencyAssessmentSchema = new Schema<ICompetencyAssessment>(
  {
    personId: { type: String, required: true, index: true },
    personName: String,
    competencyId: { type: String, required: true, index: true },
    assessor: String,
    selfLevel: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
    assessedLevel: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
    score: { type: Number, min: 0, max: 10 },
    comment: String,
    evidenceUrls: [{ type: String }],
    assessedAt: Date,
  },
  { timestamps: true }
);

CompetencyAssessmentSchema.index({ personId: 1, competencyId: 1 });
CompetencyAssessmentSchema.index({ competencyId: 1, score: -1 });

export const CompetencyAssessment = mongoose.model<ICompetencyAssessment>('CompetencyAssessment', CompetencyAssessmentSchema);
