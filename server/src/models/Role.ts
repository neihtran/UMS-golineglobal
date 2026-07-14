import mongoose, { Schema, Document, Types } from 'mongoose';
import { ROLES } from './User.js';

// ─── Role Definition Interface ───────────────────────────────────────────────
export interface IRole extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  description?: string;
  level: number;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Role Schema ────────────────────────────────────────────────────────────
const RoleSchema = new Schema<IRole>(
  {
    code: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      unique: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    level: { type: Number, required: true, index: true },
    permissions: { type: [String], default: [] },
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RoleSchema.index({ isActive: 1, level: -1 });

export const RoleModel = mongoose.model<IRole>('Role', RoleSchema);