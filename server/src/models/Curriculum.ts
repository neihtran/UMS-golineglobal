import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICurriculum extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  educationLevel: 'CĐ' | 'TC' | 'ĐH' | 'CQ' | 'LV' | 'TH';
  department?: Types.ObjectId;
  departmentName?: string;
  totalCredits: number;
  durationYears: number;
  startYear: number;
  status: 'draft' | 'active' | 'archived';
  description?: string;
  courses: Array<{
    code: string;
    name: string;
    credits: number;
    semester: number;
    isRequired: boolean;
    prereqIds: string[];
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CurriculumSchema = new Schema<ICurriculum>(
  {
    name: { type: String, required: true, text: true },
    code: { type: String, unique: true, required: true },
    educationLevel: {
      type: String,
      enum: ['CĐ', 'TC', 'ĐH', 'CQ', 'LV', 'TH'],
      required: true,
    },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    departmentName: String,
    totalCredits: { type: Number, required: true },
    durationYears: { type: Number, required: true },
    startYear: { type: Number, required: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'active',
      index: true,
    },
    description: String,
    courses: [
      {
        code: String,
        name: String,
        credits: Number,
        semester: Number,
        isRequired: { type: Boolean, default: true },
        prereqIds: [String],
      },
    ],
  },
  { timestamps: true }
);

CurriculumSchema.index({ code: 1, status: 1 });
CurriculumSchema.index({ department: 1, educationLevel: 1 });

export const Curriculum = mongoose.model<ICurriculum>('Curriculum', CurriculumSchema);
