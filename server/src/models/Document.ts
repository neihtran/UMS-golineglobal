import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDocument extends Document {
  _id: Types.ObjectId;
  code: string;
  title: string;
  type: string;
  folder?: Types.ObjectId;
  content?: string;
  fileUrl?: string;
  author?: Types.ObjectId;
  department?: Types.ObjectId;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'signed' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true, text: true },
    type: { type: String, required: true },
    folder: { type: Schema.Types.ObjectId, ref: 'DocumentFolder', index: true },
    content: String,
    fileUrl: String,
    author: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'signed', 'archived'],
      default: 'draft',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    expiresAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

DocumentSchema.index({ status: 1, author: 1 });
DocumentSchema.index({ code: 'text', title: 'text' });

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);