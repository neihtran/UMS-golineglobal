import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── TrainingSystem (Hệ đào tạo) ───────────────────────────────────────────────
// Ví dụ: Chính quy, Liên thông, Văn bằng 2, Vừa làm vừa học

export interface ITrainingSystem extends Document {
  _id: Types.ObjectId;
  code: string;                      // Mã hệ (unique): CQ, LT, VB2
  name: string;                      // Tên hệ: Chính quy, Liên thông
  description?: string;
  durationYears: number;              // Thời gian đào tạo (năm)
  status: 'draft' | 'pending' | 'published' | 'archived';
  isActive: boolean;
  externalId?: number;
  externalSource?: 'hqnhat' | 'manual';
  lastSyncedAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TrainingSystemSchema = new Schema<ITrainingSystem>(
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
    description: String,
    durationYears: {
      type: Number,
      default: 4,
      min: 1,
      max: 10,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    externalId: {
      type: Number,
      sparse: true,
    },
    externalSource: {
      type: String,
      enum: ['hqnhat', 'manual'],
      default: 'manual',
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
TrainingSystemSchema.index({ code: 1 }, { unique: true });
TrainingSystemSchema.index({ name: 'text', code: 'text' });
TrainingSystemSchema.index({ isActive: 1, status: 1 });

export const TrainingSystem = mongoose.model<ITrainingSystem>('TrainingSystem', TrainingSystemSchema);
