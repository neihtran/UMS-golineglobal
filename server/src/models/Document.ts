import mongoose, { Schema, Types } from 'mongoose';
import type { Document as MongooseDocument } from 'mongoose';

export type DocumentStatus = 'draft' | 'pending_review' | 'reviewing' | 'pending_approval' | 'approved' | 'rejected' | 'published' | 'archived';
export type DocumentUrgency = 'normal' | 'urgent' | 'very_urgent' | 'immediate';
export type DocumentSecurity = 'public' | 'internal' | 'confidential' | 'secret';

export interface IDocument extends MongooseDocument {
  _id: Types.ObjectId;
  title: string;
  documentNumber?: string;
  categoryId?: Types.ObjectId;
  categoryName?: string;
  department?: string;
  issuer?: string;
  signer?: string;
  status: DocumentStatus;
  urgency: DocumentUrgency;
  security: DocumentSecurity;
  content?: string;
  summary?: string;
  tags: string[];
  attachmentUrls: string[];
  dueDate?: Date;
  parentId?: Types.ObjectId;
  isExternal: boolean;
  externalUnit?: string;
  publishedAt?: Date;
  approvedAt?: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  auditLog: Array<{
    action: string;
    userId?: Types.ObjectId;
    timestamp: Date;
    details?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true, text: true },
    documentNumber: { type: String, unique: true, sparse: true },
    categoryId: { type: Schema.Types.ObjectId },
    categoryName: String,
    department: String,
    issuer: String,
    signer: String,
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'reviewing', 'pending_approval', 'approved', 'rejected', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    urgency: { type: String, enum: ['normal', 'urgent', 'very_urgent', 'immediate'], default: 'normal' },
    security: { type: String, enum: ['public', 'internal', 'confidential', 'secret'], default: 'internal' },
    content: String,
    summary: String,
    tags: [{ type: String }],
    attachmentUrls: [{ type: String }],
    dueDate: Date,
    parentId: { type: Schema.Types.ObjectId },
    isExternal: { type: Boolean, default: false },
    externalUnit: String,
    publishedAt: Date,
    approvedAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    auditLog: [
      {
        action: String,
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        details: String,
      },
    ],
  },
  { timestamps: true }
);

DocumentSchema.index({ status: 1, urgency: 1 });
DocumentSchema.index({ title: 'text', documentNumber: 'text' });
DocumentSchema.index({ department: 1, security: 1 });
DocumentSchema.index({ createdAt: -1 });

export const Document = mongoose.model<IDocument>('Document', DocumentSchema);
