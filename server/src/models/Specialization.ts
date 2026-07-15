import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Specialization (Chuyên ngành) ───────────────────────────────────────────
// Ví dụ: CNTT → Kỹ thuật phần mềm, AI, An toàn thông tin
// Chuyên ngành thuộc về một Ngành (Major)

export interface ISpecialization extends Document {
  _id: Types.ObjectId;
  code: string;                      // Mã chuyên ngành (unique): KTTT, AI, ATTT
  name: string;                      // Tên chuyên ngành
  major: Types.ObjectId;             // Ref: Major (ngành cha)
  description?: string;
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

const SpecializationSchema = new Schema<ISpecialization>(
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
    major: {
      type: Schema.Types.ObjectId,
      ref: 'Major',
      required: true,
    },
    description: String,
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'archived'],
      default: 'draft',
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Indexes (code unique auto-created via `unique: true`)
SpecializationSchema.index({ name: 'text', code: 'text' });
SpecializationSchema.index({ major: 1, isActive: 1 });
SpecializationSchema.index({ externalSource: 1, externalId: 1 }, { sparse: true });

export const Specialization = mongoose.model<ISpecialization>('Specialization', SpecializationSchema);
