import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── StudentClass (Lớp sinh viên) ───────────────────────────────────────────
// Mirror từ api.hqnhat.id.vn — schema: StudentClass { id, name, cohort, faculty_id, major_id, academic_advisor_id, status }
// status: 0=Disbanded, 1=Active, 2=Graduated
// Mapping: 0 → 'disbanded', 1 → 'active', 2 → 'graduated'

export interface IStudentClass extends Document {
  _id: Types.ObjectId;
  code: string;                      // Mã lớp (unique)
  name: string;                      // Tên lớp
  cohort: string;                    // Khóa (K45, K46, ...)
  faculty: Types.ObjectId;           // Ref Department (khoa quản lý)
  major: Types.ObjectId;             // Ref Major (ngành)
  academicAdvisor?: Types.ObjectId;  // Ref VienChuc (CVHT)
  status: 'disbanded' | 'active' | 'graduated';
  studentCount: number;              // Số sinh viên hiện tại (cache)
  externalId?: number;
  externalSource?: string;
  lastSyncedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudentClassSchema = new Schema<IStudentClass>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    cohort: {
      type: String,
      required: true,
      index: true,
    },
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true,
    },
    major: {
      type: Schema.Types.ObjectId,
      ref: 'Major',
      required: true,
      index: true,
    },
    academicAdvisor: {
      type: Schema.Types.ObjectId,
      ref: 'VienChuc',
    },
    status: {
      type: String,
      enum: ['disbanded', 'active', 'graduated'],
      default: 'active',
      index: true,
    },
    studentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    externalId: {
      type: Number,
      sparse: true,
    },
    externalSource: {
      type: String,
      enum: ['hqnhat', 'manual'],
      default: 'manual',
    },
    lastSyncedAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes
StudentClassSchema.index({ name: 'text', code: 'text' });
StudentClassSchema.index({ externalSource: 1, externalId: 1 }, { sparse: true });
StudentClassSchema.index({ faculty: 1, major: 1, cohort: 1 });
StudentClassSchema.index({ status: 1, faculty: 1 });

export const StudentClass = mongoose.model<IStudentClass>('StudentClass', StudentClassSchema);