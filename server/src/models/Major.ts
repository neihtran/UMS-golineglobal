import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Major (Ngành đào tạo) ──────────────────────────────────────────────────
// Mirror từ api.hqnhat.id.vn — schema: Major { id, code, name, description, status }
// Mapping:
//   - degreeLevel: 1=Cử nhân / 2=Thạc sĩ / 3=Tiến sĩ (sẽ lưu thêm trường này)
//   - faculty: liên kết Department (type=faculty) của UMS

export interface IMajor extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  description?: string;
  faculty: Types.ObjectId;          // Ref Department (type=faculty)
  degreeLevel: 1 | 2 | 3;           // Mapping từ Major API degree_level
  trainingSystem?: Types.ObjectId;  // Ref TrainingSystem (Phase 1 update)
  specialization?: Types.ObjectId;   // Ref Specialization (Phase 1 update)
  status: 'draft' | 'pending' | 'published' | 'archived';
  externalId?: number;              // ID từ api.hqnhat.id.vn
  externalSource?: string;          // 'hqnhat' | 'manual'
  lastSyncedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MajorSchema = new Schema<IMajor>(
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
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    degreeLevel: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },
    trainingSystem: {
      type: Schema.Types.ObjectId,
      ref: 'TrainingSystem',
    },
    specialization: {
      type: Schema.Types.ObjectId,
      ref: 'Specialization',
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'archived'],
      default: 'draft',
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes
MajorSchema.index({ name: 'text', code: 'text' });
MajorSchema.index({ externalSource: 1, externalId: 1 }, { sparse: true });
MajorSchema.index({ faculty: 1, status: 1 });

export const Major = mongoose.model<IMajor>('Major', MajorSchema);