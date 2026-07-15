import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── StudentProfile (Hồ sơ mở rộng sinh viên) ────────────────────────────────
// Lưu thông tin cá nhân mở rộng: gia đình, liên lạc khẩn cấp, bảo hiểm, ngân hàng

export interface IStudentProfile extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;          // Ref: Student (unique, required)
  fatherName?: string;
  fatherPhone?: string;
  fatherJob?: string;
  motherName?: string;
  motherPhone?: string;
  motherJob?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;          // Quan hệ với sinh viên
  emergencyContact?: string;
  emergencyPhone?: string;
  nationality: string;                // Default: "Việt Nam"
  ethnicity?: string;
  religion?: string;
  birthPlace?: string;              // Nơi sinh
  permanentAddress?: string;        // Địa chỉ thường trú
  temporaryAddress?: string;        // Địa chỉ tạm trú
  insuranceNumber?: string;
  insuranceExpiry?: Date;
  bankName?: string;
  bankBranch?: string;              // Chi nhánh
  bankAccount?: string;
  avatar?: string;                  // URL hoặc fileId
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true,
    },
    fatherName: { type: String, trim: true },
    fatherPhone: { type: String, trim: true },
    fatherJob: { type: String, trim: true },
    motherName: { type: String, trim: true },
    motherPhone: { type: String, trim: true },
    motherJob: { type: String, trim: true },
    guardianName: { type: String, trim: true },
    guardianPhone: { type: String, trim: true },
    guardianRelation: { type: String, trim: true },
    emergencyContact: { type: String, trim: true },
    emergencyPhone: { type: String, trim: true },
    nationality: {
      type: String,
      default: 'Việt Nam',
      trim: true,
    },
    ethnicity: { type: String, trim: true },
    religion: { type: String, trim: true },
    birthPlace: { type: String, trim: true },
    permanentAddress: { type: String, trim: true },
    temporaryAddress: { type: String, trim: true },
    insuranceNumber: { type: String, trim: true },
    insuranceExpiry: Date,
    bankName: { type: String, trim: true },
    bankBranch: { type: String, trim: true },
    bankAccount: { type: String, trim: true },
    avatar: String,
    notes: String,
  },
  { timestamps: true }
);

// Indexes (student unique auto-created via `unique: true`)
StudentProfileSchema.index({ nationality: 1, ethnicity: 1 });

export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
