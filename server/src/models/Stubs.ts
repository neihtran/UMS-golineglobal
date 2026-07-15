import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Integration Log ─────────────────────────────────────────────────────
export interface IIntegrationLog extends Document {
  _id: Types.ObjectId;
  source: string;
  event: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'success' | 'failed';
  error?: string;
  timestamp: Date;
}

const IntegrationLogSchema = new Schema<IIntegrationLog>({
  source: { type: String, required: true },
  event: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  error: String,
  timestamp: { type: Date, default: Date.now },
}, { timestamps: false });

IntegrationLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
export const IntegrationLog = mongoose.model<IIntegrationLog>('IntegrationLog', IntegrationLogSchema);

// ─── OCR Job ─────────────────────────────────────────────────────────────
export interface IOcrJob extends Document {
  _id: Types.ObjectId;
  code: string;
  fileUrl: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result?: Record<string, unknown>;
  extractedText?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OcrJobSchema = new Schema<IOcrJob>({
  code: { type: String, required: true, unique: true, trim: true },
  fileUrl: { type: String, required: true },
  status: { type: String, enum: ['queued', 'processing', 'completed', 'failed'], default: 'queued' },
  result: { type: Schema.Types.Mixed },
  extractedText: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const OcrJob = mongoose.model<IOcrJob>('OcrJob', OcrJobSchema);

// ─── DCE Competency ────────────────────────────────────────────────────
export interface IDceCompetency extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  description?: string;
  level: number;
  category: string;
  criteria: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DceCompetencySchema = new Schema<IDceCompetency>({
  code: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: String,
  level: { type: Number, default: 1 },
  category: String,
  criteria: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

DceCompetencySchema.index({ name: 'text', code: 'text' });
export const DceCompetency = mongoose.model<IDceCompetency>('DceCompetency', DceCompetencySchema);

// ─── PMS Meeting ─────────────────────────────────────────────────────
export interface IPmsMeeting extends Document {
  _id: Types.ObjectId;
  code: string;
  title: string;
  date: Date;
  attendees: Types.ObjectId[];
  content?: string;
  decisions?: string;
  minutesUrl?: string;
  status: 'scheduled' | 'held' | 'cancelled';
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PmsMeetingSchema = new Schema<IPmsMeeting>({
  code: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  content: String,
  decisions: String,
  minutesUrl: String,
  status: { type: String, enum: ['scheduled', 'held', 'cancelled'], default: 'scheduled' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const PmsMeeting = mongoose.model<IPmsMeeting>('PmsMeeting', PmsMeetingSchema);

// ─── Portal Announcement ───────────────────────────────────────────────
export interface IPortalAnnouncement extends Document {
  _id: Types.ObjectId;
  title: string;
  content: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isPublic: boolean;
  expiresAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PortalAnnouncementSchema = new Schema<IPortalAnnouncement>({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  category: { type: String, default: 'general' },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  isPublic: { type: Boolean, default: true },
  expiresAt: Date,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

PortalAnnouncementSchema.index({ isPublic: 1, expiresAt: 1 });
export const PortalAnnouncement = mongoose.model<IPortalAnnouncement>('PortalAnnouncement', PortalAnnouncementSchema);

// ─── Library Book ─────────────────────────────────────────────────────
export interface ILibBook extends Document {
  _id: Types.ObjectId;
  isbn: string;
  title: string;
  authors: string[];
  publisher?: string;
  year?: number;
  category?: string;
  copies: number;
  available: number;
  location?: string;
  description?: string;
  coverUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LibBookSchema = new Schema<ILibBook>({
  isbn: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  authors: [{ type: String }],
  publisher: String,
  year: Number,
  category: String,
  copies: { type: Number, default: 1, min: 0 },
  available: { type: Number, default: 1, min: 0 },
  location: String,
  description: String,
  coverUrl: String,
}, { timestamps: true });

LibBookSchema.index({ title: 'text', isbn: 'text' });
export const LibBook = mongoose.model<ILibBook>('LibBook', LibBookSchema);

// ─── Library Loan ─────────────────────────────────────────────────────
export interface ILibLoan extends Document {
  _id: Types.ObjectId;
  book: Types.ObjectId;
  student: Types.ObjectId;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'borrowed' | 'returned' | 'overdue' | 'lost';
  createdAt: Date;
  updatedAt: Date;
}

const LibLoanSchema = new Schema<ILibLoan>({
  book: { type: Schema.Types.ObjectId, ref: 'LibBook', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  borrowDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: Date,
  status: { type: String, enum: ['borrowed', 'returned', 'overdue', 'lost'], default: 'borrowed' },
}, { timestamps: true });

LibLoanSchema.index({ student: 1, status: 1 });
export const LibLoan = mongoose.model<ILibLoan>('LibLoan', LibLoanSchema);