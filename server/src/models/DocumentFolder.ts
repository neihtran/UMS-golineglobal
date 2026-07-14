import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDocumentFolder extends Document {
  _id: Types.ObjectId;
  name: string;
  parent?: Types.ObjectId;
  type: string;
  description?: string;
  isPublic: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentFolderSchema = new Schema<IDocumentFolder>(
  {
    name: { type: String, required: true, trim: true },
    parent: { type: Schema.Types.ObjectId, ref: 'DocumentFolder', index: true },
    type: { type: String, default: 'general' },
    description: String,
    isPublic: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

DocumentFolderSchema.index({ parent: 1, name: 1 });

export const DocumentFolder = mongoose.model<IDocumentFolder>('DocumentFolder', DocumentFolderSchema);