import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── SubjectType (Loại môn học) ────────────────────────────────────────────────
// Phân loại môn học

export type SubjectCategory = 'general' | 'foundation' | 'specialization' | 'internship' | 'thesis' | 'military' | 'physical';

export interface ISubjectType extends Document {
  _id: Types.ObjectId;
  code: string;                      // Mã loại môn học (unique)
  name: string;                      // Tên loại môn học
  description?: string;
  category: SubjectCategory;         // Danh mục
  displayOrder: number;
  status: 'active' | 'inactive';
  isActive: boolean;
  externalId?: number;
  externalSource?: 'hqnhat' | 'manual';
  lastSyncedAt?: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectTypeSchema = new Schema<ISubjectType>(
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
    category: {
      type: String,
      enum: ['general', 'foundation', 'specialization', 'internship', 'thesis', 'military', 'physical'],
      required: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
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
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Indexes (code unique auto-created via `unique: true`)
SubjectTypeSchema.index({ category: 1, displayOrder: 1 });
SubjectTypeSchema.index({ isActive: 1 });

export const SubjectType = mongoose.model<ISubjectType>('SubjectType', SubjectTypeSchema);
