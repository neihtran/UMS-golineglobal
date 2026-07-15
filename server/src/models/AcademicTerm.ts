import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── AcademicTerm (Học kỳ) ───────────────────────────────────────────────────
// Quản lý năm học và học kỳ: 2026-2027-HK1, 2026-2027-HK2

export interface IAcademicTerm extends Document {
  _id: Types.ObjectId;
  code: string;                      // Mã HK: 2026-2027-HK1
  academicYear: string;             // Năm học: 2026-2027
  semester: number;                  // Học kỳ: 1, 2, 3 (HK3 = hè)
  termType: 'regular' | 'summer' | 'short';  // Loại HK: chính, hè, ngắn hạn
  startDate: Date;                  // Ngày bắt đầu
  endDate: Date;                    // Ngày kết thúc
  registrationStart: Date;           // Ngày bắt đầu đăng ký
  registrationEnd: Date;            // Ngày kết thúc đăng ký
  status: 'planning' | 'registration' | 'studying' | 'grading' | 'finished';
  isActive: boolean;
  isCurrent: boolean;               // Đánh dấu HK hiện tại
  externalId?: number;
  externalSource?: 'hqnhat' | 'manual';
  lastSyncedAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicTermSchema = new Schema<IAcademicTerm>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },
    termType: {
      type: String,
      enum: ['regular', 'summer', 'short'],
      default: 'regular',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    registrationStart: Date,
    registrationEnd: Date,
    status: {
      type: String,
      enum: ['planning', 'registration', 'studying', 'grading', 'finished'],
      default: 'planning',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
      index: true,
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Indexes
AcademicTermSchema.index({ code: 1 }, { unique: true });
AcademicTermSchema.index({ academicYear: 1, semester: 1 }, { unique: true });
AcademicTermSchema.index({ status: 1, isCurrent: 1 });
AcademicTermSchema.index({ registrationStart: 1, registrationEnd: 1 });
AcademicTermSchema.index({ externalSource: 1, externalId: 1 }, { sparse: true });

// Pre-save: ensure only one current term
AcademicTermSchema.pre('save', async function (next) {
  if (this.isCurrent && this.isModified('isCurrent')) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, isCurrent: true },
      { isCurrent: false }
    );
  }
  next();
});

export const AcademicTerm = mongoose.model<IAcademicTerm>('AcademicTerm', AcademicTermSchema);
