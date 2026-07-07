import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDepartment extends Document {
  _id: Types.ObjectId;
  code: string; // e.g. "KHOA_CNTT", "P_TOCHUC"
  name: string; // e.g. "Khoa Công nghệ Thông tin"
  shortName?: string;
  type: 'faculty' | 'department' | 'center' | 'office' | 'institute';
  parent?: Types.ObjectId; // for nested hierarchy
  manager?: Types.ObjectId; // ref: User (Trưởng khoa / Trưởng phòng)
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true, text: true },
    shortName: String,
    type: {
      type: String,
      enum: ['faculty', 'department', 'center', 'office', 'institute'],
      required: true,
    },
    parent: { type: Schema.Types.ObjectId, ref: 'Department' },
    manager: { type: Schema.Types.ObjectId, ref: 'User' },
    phone: String,
    email: String,
    address: String,
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

DepartmentSchema.index({ name: 'text', code: 'text' });
DepartmentSchema.index({ type: 1, isActive: 1 });

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);
