import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── ExternalMapping ────────────────────────────────────────────────────────
// Bảng mapping giữa ID của hệ thống bên ngoài (int) ↔ ObjectId của UMS.
// Mục đích:
//   1. Tránh trùng lặp khi sync (unique index trên source+entity+externalId)
//   2. Cho phép rollback/audit sync
//   3. Tra cứu nhanh UMS entity từ external ID
//   4. Lưu hash để delta sync

export type ExternalSource = 'hqnhat' | 'hemis' | 'vneid' | 'manual';
export type MappingEntity =
  | 'Faculty'
  | 'Major'
  | 'CourseGroup'
  | 'Course'         // map sang Subject
  | 'Curriculum'
  | 'StudentClass'
  | 'Student'
  | 'User';

export interface IExternalMapping extends Document {
  _id: Types.ObjectId;
  source: ExternalSource;
  entity: MappingEntity;
  externalId: number;              // ID integer từ external API
  umsId: Types.ObjectId;           // ObjectId trong UMS
  umsModel: string;                // Tên Mongoose model (Department, Subject, ...)
  externalHash?: string;           // MD5/SHA256 của payload, dùng cho delta sync
  metadata?: Record<string, unknown>; // Snapshot field quan trọng để audit
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExternalMappingSchema = new Schema<IExternalMapping>(
  {
    source: {
      type: String,
      enum: ['hqnhat', 'hemis', 'vneid', 'manual'],
      required: true,
    },
    entity: {
      type: String,
      required: true,
    },
    externalId: {
      type: Number,
      required: true,
    },
    umsId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    umsModel: {
      type: String,
      required: true,
    },
    externalHash: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
// Unique: một entity từ một source chỉ map sang một umsId
ExternalMappingSchema.index(
  { source: 1, entity: 1, externalId: 1 },
  { unique: true }
);
// Reverse lookup: tìm externalId từ umsId
ExternalMappingSchema.index({ umsId: 1, entity: 1 });
// Delta sync: tìm các record đã sync gần nhất
ExternalMappingSchema.index({ source: 1, entity: 1, lastSyncedAt: -1 });

export const ExternalMapping = mongoose.model<IExternalMapping>('ExternalMapping', ExternalMappingSchema);