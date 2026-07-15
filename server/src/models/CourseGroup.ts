import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── CourseGroup (Nhóm học phần) ────────────────────────────────────────────
// Mirror từ api.hqnhat.id.vn — schema: CourseGroup { id, name, parent }
// Cấu trúc cây phân cấp (parent self-ref) — ví dụ: Toán-CS > Toán rời rạc, Giải tích

export interface ICourseGroup extends Document {
  _id: Types.ObjectId;
  name: string;
  code?: string;                   // Optional, thường dùng cho nhóm chuẩn
  parent?: Types.ObjectId;          // Ref CourseGroup (self)
  description?: string;
  order: number;                    // Thứ tự hiển thị
  externalId?: number;
  externalSource?: string;
  lastSyncedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseGroupSchema = new Schema<ICourseGroup>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'CourseGroup',
      index: true,
    },
    description: String,
    order: {
      type: Number,
      default: 0,
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
      index: true,
    },
  },
  { timestamps: true }
);

// Indexes
CourseGroupSchema.index({ name: 'text', code: 'text' });
CourseGroupSchema.index({ externalSource: 1, externalId: 1 }, { sparse: true });
CourseGroupSchema.index({ parent: 1, order: 1 });

export const CourseGroup = mongoose.model<ICourseGroup>('CourseGroup', CourseGroupSchema);