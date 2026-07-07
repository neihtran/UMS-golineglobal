import mongoose, { Schema, Document, Types } from 'mongoose';

export type AnnouncementStatus = 'draft' | 'published' | 'archived' | 'pinned';
export type AnnouncementCategory = 'news' | 'event' | 'academic' | 'hr' | 'finance' | 'general' | 'urgent';

export interface IAnnouncement extends Document {
  _id: Types.ObjectId;
  title: string;
  content: string;
  summary?: string;
  category: AnnouncementCategory;
  status: AnnouncementStatus;
  author?: string;
  authorName?: string;
  coverImage?: string;
  attachments: string[];
  tags: string[];
  department?: string;
  targetRoles: string[];
  pinnedAt?: Date;
  publishAt?: Date;
  expiresAt?: Date;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, text: true },
    content: { type: String, required: true },
    summary: String,
    category: { type: String, enum: ['news', 'event', 'academic', 'hr', 'finance', 'general', 'urgent'], default: 'general', index: true },
    status: { type: String, enum: ['draft', 'published', 'archived', 'pinned'], default: 'published', index: true },
    author: String,
    authorName: String,
    coverImage: String,
    attachments: [{ type: String }],
    tags: [{ type: String }],
    department: String,
    targetRoles: [{ type: String }],
    pinnedAt: Date,
    publishAt: Date,
    expiresAt: Date,
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

AnnouncementSchema.index({ status: 1, createdAt: -1 });
AnnouncementSchema.index({ category: 1, status: 1 });
AnnouncementSchema.index({ title: 'text', content: 'text' });

export const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
