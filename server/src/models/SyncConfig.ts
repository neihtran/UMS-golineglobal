import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── SyncConfig ─────────────────────────────────────────────────────────────
// Cấu hình chế độ đồng bộ cho mỗi entity từ external API.
// Cho phép admin chọn:
//   - MASTER: UMS quản lý, không sync từ external
//   - MIRROR: UMS mirror dữ liệu từ external (ghi đè local)
//   - READ_ONLY: Chỉ xem qua proxy, không lưu UMS
//   - DISABLED: Tắt sync

export type SyncMode = 'MASTER' | 'MIRROR' | 'READ_ONLY' | 'DISABLED';
export type SyncEntity =
  | 'Faculty'
  | 'Major'
  | 'CourseGroup'
  | 'Course'
  | 'Curriculum'
  | 'StudentClass'
  | 'Student';

export interface ISyncConfig extends Document {
  _id: Types.ObjectId;
  source: string;                       // 'hqnhat'
  entity: SyncEntity;                   // Tên entity
  mode: SyncMode;                       // Chế độ đồng bộ
  cronExpression?: string;              // Override cron mặc định
  enabled: boolean;                     // Bật/tắt job cho entity này
  conflictStrategy?: 'source_wins' | 'ums_wins' | 'newest_wins' | 'manual_review';
  lastRunAt?: Date;
  lastRunStatus?: 'success' | 'failed' | 'skipped';
  lastRunMessage?: string;
  notifyEmails?: string[];              // Email nhận thông báo khi sync fail
  metadata?: Record<string, unknown>;   // Config bổ sung (e.g., filters)
  updatedBy?: Types.ObjectId;           // User cập nhật config
  createdAt: Date;
  updatedAt: Date;
}

const SyncConfigSchema = new Schema<ISyncConfig>(
  {
    source: {
      type: String,
      required: true,
      default: 'hqnhat',
      index: true,
    },
    entity: {
      type: String,
      required: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ['MASTER', 'MIRROR', 'READ_ONLY', 'DISABLED'],
      default: 'MASTER',
    },
    cronExpression: String,
    enabled: {
      type: Boolean,
      default: true,
    },
    conflictStrategy: {
      type: String,
      enum: ['source_wins', 'ums_wins', 'newest_wins', 'manual_review'],
      default: 'source_wins',
    },
    lastRunAt: Date,
    lastRunStatus: {
      type: String,
      enum: ['success', 'failed', 'skipped'],
    },
    lastRunMessage: String,
    notifyEmails: [{ type: String, lowercase: true, trim: true }],
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Unique: mỗi (source, entity) chỉ có một config
SyncConfigSchema.index({ source: 1, entity: 1 }, { unique: true });

export const SyncConfig = mongoose.model<ISyncConfig>('SyncConfig', SyncConfigSchema);