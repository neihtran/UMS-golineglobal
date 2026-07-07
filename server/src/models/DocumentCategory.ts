import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDocumentCategory extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  parent?: Types.ObjectId;
  color?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentCategorySchema = new Schema<IDocumentCategory>(
  {
    name: { type: String, required: true },
    code: { type: String, unique: true, required: true },
    description: String,
    parent: { type: Schema.Types.ObjectId, ref: 'DocumentCategory' },
    color: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

DocumentCategorySchema.index({ code: 1, isActive: 1 });

export const DocumentCategory = mongoose.model<IDocumentCategory>('DocumentCategory', DocumentCategorySchema);
