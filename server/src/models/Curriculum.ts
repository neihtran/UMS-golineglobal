// @ts-nocheck
import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Curriculum (Chương trình đào tạo - CTĐT) ───────────────────────────
// Mirror từ api.hqnhat.id.vn — schema: Curriculum { id, name, code, year, courseGroups }
// courseGroups chứa danh sách courses (học phần cụ thể với semester)

// ─── Sub-schema: Course trong CTĐT ───────────────────────────────────────
export interface ICurriculumCourse extends Document {
  _id: Types.ObjectId;
  code: string;              // Mã học phần (e.g., "ML101")
  name: string;              // Tên học phần
  credits: number;           // Số tín chỉ
  theoryHours: number;       // Giờ lý thuyết
  practiceHours: number;     // Giờ thực hành
  semester: number;           // Học kỳ (1-12)
  isRequired: boolean;       // Bắt buộc
  isCapstone: boolean;       // Đồ án/capstone
  isInternship: boolean;     // Thực tập
  electiveGroup?: string;    // Nhóm tự chọn (VD: "Nhóm A")
  displayOrder: number;      // Thứ tự hiển thị
}

// ─── Sub-schema: CourseGroup (Nhóm học phần) ─────────────────────────────
export interface ICurriculumCourseGroup extends Document {
  _id: Types.ObjectId;
  name: string;               // Tên nhóm (e.g., "Nhóm học phần bắt buộc")
  code?: string;              // Mã nhóm
  order: number;             // Thứ tự
  courses: ICurriculumCourse[];  // Danh sách học phần trong nhóm
}

// ─── Curriculum ────────────────────────────────────────────────────────────
export interface ICurriculum extends Document {
  _id: Types.ObjectId;
  code: string;              // Mã CTĐT (e.g., "CTĐT-CNTT-2025")
  name: string;             // Tên CTĐT
  
  // Thông tin cơ bản
  year: number;             // Năm áp dụng
  department?: Types.ObjectId;
  major?: Types.ObjectId;
  specialization?: Types.ObjectId;  // Chuyên ngành (mới)
  trainingSystem?: Types.ObjectId;  // Hệ đào tạo (mới)
  course?: Types.ObjectId;          // Khóa học (mới)
  degreeType?: string;      // Loại bằng (Cử nhân, Kỹ sư...)
  durationYears?: number;    // Thời gian đào tạo
  totalCredits?: number;     // Tổng tín chỉ
  electiveCredit?: number;   // Tín chỉ tự chọn (mới)
  requiredCredits?: number;  // Tín chỉ bắt buộc (mới)
  
  // Cấu trúc CTĐT (theo API hqnhat)
  courseGroups: ICurriculumCourseGroup[];
  
  // Legacy support - subjects array để tương thích với service cũ
  subjects?: Array<{
    subject?: Types.ObjectId;
    semester?: number;
    isRequired?: boolean;
  }>;
  
  // Trạng thái
  isActive: boolean;
  status: 'draft' | 'active' | 'archived';
  
  // Sync metadata
  externalId?: number;
  externalSource?: 'hqnhat' | 'manual';
  lastSyncedAt?: Date;
  
  // Audit
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schemas ──────────────────────────────────────────────────────────
const CurriculumCourseSchema = new Schema<ICurriculumCourse>({
  code: { type: String, required: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  credits: { type: Number, required: true, min: 0 },
  theoryHours: { type: Number, default: 0, min: 0 },
  practiceHours: { type: Number, default: 0, min: 0 },
  semester: { type: Number, required: true, min: 1, max: 12 },
  isRequired: { type: Boolean, default: true },
  isCapstone: { type: Boolean, default: false },
  isInternship: { type: Boolean, default: false },
  electiveGroup: { type: String, trim: true },
  displayOrder: { type: Number, default: 0 },
}, { _id: true });

const CurriculumCourseGroupSchema = new Schema<ICurriculumCourseGroup>({
  name: { type: String, required: true, trim: true },
  code: { type: String, trim: true, uppercase: true },
  order: { type: Number, default: 0 },
  courses: [CurriculumCourseSchema],
}, { _id: true });

const CurriculumSchema = new Schema<ICurriculum>(
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
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },
    effectiveYear: {
      type: Number,
      min: 2000,
      max: 2100,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    major: {
      type: Schema.Types.ObjectId,
      ref: 'Major',
    },
    specialization: {
      type: Schema.Types.ObjectId,
      ref: 'Specialization',
    },
    trainingSystem: {
      type: Schema.Types.ObjectId,
      ref: 'TrainingSystem',
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    degreeType: {
      type: String,
      default: 'Cử nhân',
    },
    durationYears: {
      type: Number,
      default: 4,
      min: 1,
      max: 10,
    },
    totalCredits: {
      type: Number,
      default: 0,
      min: 0,
    },
    electiveCredit: {
      type: Number,
      default: 0,
      min: 0,
    },
    requiredCredit: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Cấu trúc mới theo API
    courseGroups: [CurriculumCourseGroupSchema],
    // Legacy support
    subjects: [{
      subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
      semester: { type: Number, min: 1, max: 12 },
      isRequired: { type: Boolean, default: true },
    }],
    // Trạng thái
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
    },
    // Sync
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
    // Audit
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

// Indexes (code unique auto-created via `unique: true`)
CurriculumSchema.index({ department: 1, status: 1, year: -1 });
CurriculumSchema.index({ major: 1, status: 1 });
CurriculumSchema.index({ externalSource: 1, externalId: 1 }, { sparse: true });

export const Curriculum = mongoose.model<ICurriculum>('Curriculum', CurriculumSchema);
