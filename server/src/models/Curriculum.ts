import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICurriculum extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  department: Types.ObjectId;
  degreeType: 'Cử nhân' | 'Kỹ sư' | 'Thạc sĩ' | 'Tiến sĩ';
  durationYears: number;
  totalCredits: number;
  subjects: Array<{
    subject: Types.ObjectId;
    semester: number;
    isRequired: boolean;
  }>;
  effectiveYear: number;
  status: 'draft' | 'active' | 'archived';
  description?: string;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CurriculumSchema = new Schema<ICurriculum>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true, text: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    degreeType: {
      type: String,
      enum: ['Cử nhân', 'Kỹ sư', 'Thạc sĩ', 'Tiến sĩ'],
      required: true,
    },
    durationYears: { type: Number, required: true, min: 1, max: 8 },
    totalCredits: { type: Number, required: true, min: 0 },
    subjects: [{
      subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
      semester: { type: Number, required: true, min: 1, max: 12 },
      isRequired: { type: Boolean, default: true },
    }],
    effectiveYear: { type: Number, required: true, min: 2000 },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
      index: true,
    },
    description: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

CurriculumSchema.index({ status: 1, department: 1 });
CurriculumSchema.index({ effectiveYear: 1 });

export const Curriculum = mongoose.model<ICurriculum>('Curriculum', CurriculumSchema);