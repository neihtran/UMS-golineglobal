import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Student (Sinh viên) ─────────────────────────────────────────────────────
// Mở rộng Phase 2: thêm refs, citizenId, avatar, new status values

export interface IStudent extends Document {
  _id: Types.ObjectId;
  code: string;                      // Mã sinh viên (unique)
  name: string;                      // Họ và tên đầy đủ
  dob?: Date;                       // Ngày sinh
  gender?: 'Nam' | 'Nữ' | 'Khác';
  phone?: string;
  email?: string;
  address?: string;
  // Phase 2 updates
  citizenId?: string;               // CCCD/CMND
  avatar?: string;                  // URL avatar
  ethnicity?: string;
  nationality?: string;
  // Relations (Phase 2)
  user?: Types.ObjectId;           // Tài khoản portal
  department?: Types.ObjectId;     // Khoa phụ trách
  class?: Types.ObjectId;          // Lớp hành chính (StudentClass)
  specialization?: Types.ObjectId;  // Chuyên ngành
  trainingSystem?: Types.ObjectId;   // Hệ đào tạo
  course?: Types.ObjectId;          // Khóa học (niên khóa)
  admissionStudent?: Types.ObjectId; // Ứng viên trúng tuyển
  // Academic info
  enrollmentDate?: Date;            // Ngày nhập học
  gpa?: number;
  totalCredits?: number;
  // Status (Phase 2 - mở rộng)
  status: 'studying' | 'reserved' | 'graduated' | 'dropped' | 'transferred';
  // Audit
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dob: Date,
    gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'] },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: String,
    // Phase 2 new fields
    citizenId: { type: String, trim: true },      // CCCD
    avatar: String,
    ethnicity: { type: String, default: 'Kinh' },
    nationality: { type: String, default: 'Việt Nam' },
    // Relations
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    department: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    class: { type: Schema.Types.ObjectId, ref: 'StudentClass', index: true },
    specialization: { type: Schema.Types.ObjectId, ref: 'Specialization', index: true },
    trainingSystem: { type: Schema.Types.ObjectId, ref: 'TrainingSystem', index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    admissionStudent: { type: Schema.Types.ObjectId, ref: 'AdmissionStudent' },
    // Academic
    enrollmentDate: Date,
    gpa: Number,
    totalCredits: Number,
    // Status - Phase 2 mở rộng
    status: {
      type: String,
      enum: ['studying', 'reserved', 'graduated', 'dropped', 'transferred'],
      default: 'studying',
      index: true,
    },
    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Indexes
StudentSchema.index({ code: 1 }, { unique: true });
StudentSchema.index({ name: 'text', code: 'text', email: 'text' });
StudentSchema.index({ class: 1, status: 1 });
StudentSchema.index({ specialization: 1, status: 1 });
StudentSchema.index({ department: 1, status: 1 });
StudentSchema.index({ trainingSystem: 1, status: 1 });
StudentSchema.index({ enrollmentDate: -1 });

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
