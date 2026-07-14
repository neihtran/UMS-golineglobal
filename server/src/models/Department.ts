import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Department Interface ────────────────────────────────────────────────────
export interface IDepartment extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  shortName?: string;
  type: 'faculty' | 'department' | 'center' | 'office';
  parent?: Types.ObjectId;
  head?: Types.ObjectId; // User ID of head
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Department Schema ──────────────────────────────────────────────────────
const DepartmentSchema = new Schema<IDepartment>(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shortName: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['faculty', 'department', 'center', 'office'],
      required: true,
      default: 'department',
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    head: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    phone: String,
    email: String,
    address: String,
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
DepartmentSchema.index({ code: 1 }, { unique: true });
DepartmentSchema.index({ name: 'text' });
DepartmentSchema.index({ type: 1 });
DepartmentSchema.index({ parent: 1 });

// ─── Virtuals ──────────────────────────────────────────────────────────────
DepartmentSchema.virtual('vienChucs', {
  ref: 'VienChuc',
  localField: '_id',
  foreignField: 'department',
});

DepartmentSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'department',
});

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);
