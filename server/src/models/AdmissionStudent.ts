import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── AdmissionStudent (Thí sinh trúng tuyển) ─────────────────────────────────

export type AdmissionStudentStatus = 'pending' | 'accepted' | 'enrolled' | 'cancelled';
export type Gender = 'Nam' | 'Nữ' | 'Khác';

export interface IAdmissionStudent extends Document {
  _id: Types.ObjectId;
  batch: Types.ObjectId;                   // Ref: AdmissionBatch
  candidateCode: string;                  // Mã thí sinh (unique)
  fullName: string;
  gender?: Gender;
  dateOfBirth?: Date;
  citizenId?: string;
  phone?: string;
  email?: string;
  address?: string;
  nationality?: string;
  major?: Types.ObjectId;                  // Ref: Major
  trainingSystem?: Types.ObjectId;        // Ref: TrainingSystem
  admissionScore?: number;
  priorityLevel?: number;
  status: AdmissionStudentStatus;
  enrollmentDate?: Date;
  studentCode?: string;                    // Mã sinh viên (gán khi nhập học)
  student?: Types.ObjectId;                // Ref: Student (link khi nhập học)
  notes?: string;
  externalId?: number;
  externalSource?: 'hqnhat' | 'manual';
  lastSyncedAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AdmissionStudentSchema = new Schema<IAdmissionStudent>(
  {
    batch: {
      type: Schema.Types.ObjectId,
      ref: 'AdmissionBatch',
      required: true,
    },
    candidateCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Nam', 'Nữ', 'Khác'],
    },
    dateOfBirth: Date,
    citizenId: String,
    phone: String,
    email: String,
    address: String,
    nationality: String,
    major: {
      type: Schema.Types.ObjectId,
      ref: 'Major',
    },
    trainingSystem: {
      type: Schema.Types.ObjectId,
      ref: 'TrainingSystem',
    },
    admissionScore: {
      type: Number,
      min: 0,
      max: 30,
    },
    priorityLevel: {
      type: Number,
      min: 1,
      max: 3,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'enrolled', 'cancelled'],
      default: 'pending',
    },
    enrollmentDate: Date,
    studentCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
    },
    notes: String,
    externalId: Number,
    externalSource: {
      type: String,
      enum: ['hqnhat', 'manual'],
    },
    lastSyncedAt: Date,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Indexes (candidateCode unique auto-created via `unique: true`)
AdmissionStudentSchema.index({ batch: 1, status: 1 });
AdmissionStudentSchema.index({ student: 1 }, { sparse: true });
AdmissionStudentSchema.index({ batch: 1, admissionScore: -1 });

export const AdmissionStudent = mongoose.model<IAdmissionStudent>('AdmissionStudent', AdmissionStudentSchema);
