import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Exam ─────────────────────────────────────────────────────────────────
export interface IExam extends Document {
  _id: Types.ObjectId;
  code: string;
  title: string;
  course?: Types.ObjectId;
  semester: number;
  academicYear: string;
  type: 'midterm' | 'final' | 'quiz' | 'practical' | 'other';
  duration: number;
  totalScore: number;
  passingScore: number;
  scheduledAt?: Date;
  room?: string;
  status: 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExam>({
  code: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
  semester: { type: Number, min: 1, max: 12 },
  academicYear: { type: String },
  type: { type: String, enum: ['midterm', 'final', 'quiz', 'practical', 'other'], default: 'final' },
  duration: { type: Number, default: 90 },
  totalScore: { type: Number, default: 10 },
  passingScore: { type: Number, default: 5 },
  scheduledAt: Date,
  room: String,
  status: { type: String, enum: ['draft', 'scheduled', 'ongoing', 'completed', 'cancelled'], default: 'draft', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

ExamSchema.index({ semester: 1, academicYear: 1 });
export const Exam = mongoose.model<IExam>('Exam', ExamSchema);

// ─── Exam Submission ─────────────────────────────────────────────────────
export interface IExamSubmission extends Document {
  _id: Types.ObjectId;
  exam: Types.ObjectId;
  student: Types.ObjectId;
  score?: number;
  status: 'absent' | 'submitted' | 'graded';
  submittedAt?: Date;
  gradedAt?: Date;
  gradedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSubmissionSchema = new Schema<IExamSubmission>({
  exam: { type: Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  score: { type: Number, min: 0 },
  status: { type: String, enum: ['absent', 'submitted', 'graded'], default: 'submitted', index: true },
  submittedAt: Date,
  gradedAt: Date,
  gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

ExamSubmissionSchema.index({ exam: 1, student: 1 }, { unique: true });
export const ExamSubmission = mongoose.model<IExamSubmission>('ExamSubmission', ExamSubmissionSchema);

// ─── Research Project ───────────────────────────────────────────────────
export interface IResearchProject extends Document {
  _id: Types.ObjectId;
  code: string;
  title: string;
  field: string;
  level: string;
  startDate?: Date;
  endDate?: Date;
  budget: number;
  leader: Types.ObjectId;
  members: Types.ObjectId[];
  status: 'proposal' | 'approved' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ResearchProjectSchema = new Schema<IResearchProject>({
  code: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  field: String,
  level: String,
  startDate: Date,
  endDate: Date,
  budget: { type: Number, default: 0 },
  leader: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['proposal', 'approved', 'ongoing', 'completed', 'cancelled'], default: 'proposal', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const ResearchProject = mongoose.model<IResearchProject>('ResearchProject', ResearchProjectSchema);

// ─── KPI ────────────────────────────────────────────────────────────────
export interface IKPI extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  module: string;
  target: number;
  current: number;
  unit: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  year: number;
  status: 'active' | 'achieved' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const KPISchema = new Schema<IKPI>({
  code: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  module: String,
  target: { type: Number, default: 0 },
  current: { type: Number, default: 0 },
  unit: { type: String, default: 'count' },
  period: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'yearly' },
  year: { type: Number, min: 2000 },
  status: { type: String, enum: ['active', 'achieved', 'failed'], default: 'active', index: true },
}, { timestamps: true });

export const KPI = mongoose.model<IKPI>('KPI', KPISchema);

// ─── KTX Room ─────────────────────────────────────────────────────────
export interface IKtxRoom extends Document {
  _id: Types.ObjectId;
  code: string;
  building: string;
  floor: number;
  type: 'male' | 'female' | 'mixed';
  capacity: number;
  currentOccupancy: number;
  pricePerMonth: number;
  facilities: string[];
  status: 'available' | 'full' | 'maintenance' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const KtxRoomSchema = new Schema<IKtxRoom>({
  code: { type: String, required: true, unique: true, trim: true },
  building: { type: String, required: true },
  floor: { type: Number, required: true },
  type: { type: String, enum: ['male', 'female', 'mixed'], default: 'mixed' },
  capacity: { type: Number, default: 6, min: 1 },
  currentOccupancy: { type: Number, default: 0 },
  pricePerMonth: { type: Number, default: 0 },
  facilities: [String],
  status: { type: String, enum: ['available', 'full', 'maintenance', 'closed'], default: 'available', index: true },
}, { timestamps: true });

KtxRoomSchema.index({ building: 1, floor: 1 });
export const KtxRoom = mongoose.model<IKtxRoom>('KtxRoom', KtxRoomSchema);

// ─── QA Evidence ─────────────────────────────────────────────────────
export interface IQaEvidence extends Document {
  _id: Types.ObjectId;
  standard: string;
  criteria: string;
  title: string;
  description?: string;
  fileUrls: string[];
  uploadedBy: Types.ObjectId;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const QaEvidenceSchema = new Schema<IQaEvidence>({
  standard: { type: String, required: true },
  criteria: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: String,
  fileUrls: [String],
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected'], default: 'draft', index: true },
}, { timestamps: true });

QaEvidenceSchema.index({ standard: 1, criteria: 1 });
export const QaEvidence = mongoose.model<IQaEvidence>('QaEvidence', QaEvidenceSchema);

// ─── WMS Task ─────────────────────────────────────────────────────────
export interface IWmsTask extends Document {
  _id: Types.ObjectId;
  code: string;
  title: string;
  description?: string;
  project?: Types.ObjectId;
  assignee?: Types.ObjectId;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  dueDate?: Date;
  completedAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WmsTaskSchema = new Schema<IWmsTask>({
  code: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: String,
  project: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
  assignee: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['todo', 'in_progress', 'review', 'done', 'cancelled'], default: 'todo', index: true },
  dueDate: Date,
  completedAt: Date,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

WmsTaskSchema.index({ assignee: 1, status: 1 });
export const WmsTask = mongoose.model<IWmsTask>('WmsTask', WmsTaskSchema);