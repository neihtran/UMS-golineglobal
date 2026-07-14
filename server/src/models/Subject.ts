import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubject extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  credits: number;
  theoryHours: number;
  practiceHours: number;
  description?: string;
  department?: Types.ObjectId;
  prerequisite?: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true, text: true },
    credits: { type: Number, required: true, min: 1, max: 10 },
    theoryHours: { type: Number, default: 0, min: 0 },
    practiceHours: { type: Number, default: 0, min: 0 },
    description: String,
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    prerequisite: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SubjectSchema.index({ name: 'text', code: 'text' });
SubjectSchema.index({ isActive: 1 });

export const Subject = mongoose.model<ISubject>('Subject', SubjectSchema);