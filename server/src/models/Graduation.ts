import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGraduationSession extends Document {
  _id: Types.ObjectId;
  name: string;
  academicYear: string;
  semester: string;
  status: 'upcoming' | 'open' | 'closed';
  openDate?: Date;
  closeDate?: Date;
  decisionNumber?: string;
  decisionDate?: Date;
  totalGraduated: number;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GraduationSessionSchema = new Schema<IGraduationSession>(
  {
    name: { type: String, required: true },
    academicYear: { type: String, required: true, index: true },
    semester: { type: String, required: true },
    status: {
      type: String,
      enum: ['upcoming', 'open', 'closed'],
      default: 'upcoming',
      index: true,
    },
    openDate: Date,
    closeDate: Date,
    decisionNumber: String,
    decisionDate: Date,
    totalGraduated: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

GraduationSessionSchema.index({ academicYear: 1, status: 1 });

export const GraduationSession = mongoose.model<IGraduationSession>('GraduationSession', GraduationSessionSchema);

export interface IGraduationRecord extends Document {
  _id: Types.ObjectId;
  studentId: string;
  studentName: string;
  graduationSessionId: Types.ObjectId;
  decisionNumber?: string;
  decisionDate?: Date;
  degree: string;
  classification: string;
  gpa: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GraduationRecordSchema = new Schema<IGraduationRecord>(
  {
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    graduationSessionId: { type: Schema.Types.ObjectId, ref: 'GraduationSession', index: true },
    decisionNumber: String,
    decisionDate: Date,
    degree: String,
    classification: String,
    gpa: { type: Number, min: 0, max: 10 },
    note: String,
  },
  { timestamps: true }
);

GraduationRecordSchema.index({ studentId: 1, graduationSessionId: 1 }, { unique: true });

export const GraduationRecord = mongoose.model<IGraduationRecord>('GraduationRecord', GraduationRecordSchema);
