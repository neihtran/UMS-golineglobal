import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubject extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  credits: number;
  theoryHours: number;
  practiceHours: number;
  department?: Types.ObjectId;
  departmentName?: string;
  prereqIds: string[];
  semesterOffered: string[];
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    code: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true, text: true },
    credits: { type: Number, required: true, min: 1, max: 10 },
    theoryHours: { type: Number, default: 0, min: 0 },
    practiceHours: { type: Number, default: 0, min: 0 },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    departmentName: String,
    prereqIds: [{ type: String }],
    semesterOffered: [{ type: String }],
    description: String,
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

SubjectSchema.index({ name: 'text', code: 'text' });
SubjectSchema.index({ department: 1, isActive: 1 });

export const Subject = mongoose.model<ISubject>('Subject', SubjectSchema);
