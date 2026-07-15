import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGraduationSession extends Document {
  _id: Types.ObjectId;
  name: string;
  semester: string;
  academicYear: string;
  openDate: Date;
  closeDate: Date;
  reviewDate?: Date;
  status: 'draft' | 'open' | 'closed' | 'reviewed';
  description?: string;
  totalCandidates: number;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GraduationSessionSchema = new Schema<IGraduationSession>(
  {
    name: { type: String, required: true, trim: true },
    semester: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    openDate: { type: Date, required: true },
    closeDate: { type: Date, required: true },
    reviewDate: Date,
    status: {
      type: String,
      enum: ['draft', 'open', 'closed', 'reviewed'],
      default: 'draft',
    },
    description: String,
    totalCandidates: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

GraduationSessionSchema.index({ academicYear: 1, semester: 1 });
GraduationSessionSchema.index({ status: 1, openDate: 1 });

export const GraduationSession = mongoose.model<IGraduationSession>(
  'GraduationSession',
  GraduationSessionSchema
);