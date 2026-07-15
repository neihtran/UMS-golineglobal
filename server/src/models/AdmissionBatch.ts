import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── AdmissionBatch (Đợt tuyển sinh) ──────────────────────────────────────────

export type AdmissionType = 'regular' | 'transfer' | 'second_degree';
export type BatchStatus = 'draft' | 'open' | 'closed' | 'enrolled';

export interface IAdmissionBatch extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  year: number;
  admissionType: AdmissionType;
  startDate?: Date;
  endDate?: Date;
  resultDate?: Date;
  enrollmentStartDate?: Date;
  enrollmentEndDate?: Date;
  status: BatchStatus;
  totalCandidates: number;
  totalEnrolled: number;
  description?: string;
  isActive: boolean;
  externalId?: number;
  externalSource?: 'hqnhat' | 'manual';
  lastSyncedAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AdmissionBatchSchema = new Schema<IAdmissionBatch>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    admissionType: {
      type: String,
      enum: ['regular', 'transfer', 'second_degree'],
      required: true,
      index: true,
    },
    startDate: Date,
    endDate: Date,
    resultDate: Date,
    enrollmentStartDate: Date,
    enrollmentEndDate: Date,
    status: {
      type: String,
      enum: ['draft', 'open', 'closed', 'enrolled'],
      default: 'draft',
      index: true,
    },
    totalCandidates: {
      type: Number,
      default: 0,
    },
    totalEnrolled: {
      type: Number,
      default: 0,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
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

// Indexes
AdmissionBatchSchema.index({ code: 1 }, { unique: true });
AdmissionBatchSchema.index({ year: 1, admissionType: 1 });
AdmissionBatchSchema.index({ status: 1 });

export const AdmissionBatch = mongoose.model<IAdmissionBatch>('AdmissionBatch', AdmissionBatchSchema);
