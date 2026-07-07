import mongoose, { Schema, Document, Types } from 'mongoose';

export type OcrJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface IOCRJob extends Document {
  _id: Types.ObjectId;
  source: 'upload' | 'scan' | 'url';
  fileUrl?: string;
  fileName?: string;
  language: string;
  outputFormat: 'txt' | 'pdf' | 'docx' | 'json';
  category?: string;
  documentId?: string;
  tags: string[];
  status: OcrJobStatus;
  resultText?: string;
  confidence?: number;
  processingTimeMs?: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OCRJobSchema = new Schema<IOCRJob>(
  {
    source: { type: String, enum: ['upload', 'scan', 'url'], required: true },
    fileUrl: String,
    fileName: String,
    language: { type: String, default: 'vie' },
    outputFormat: { type: String, enum: ['txt', 'pdf', 'docx', 'json'], default: 'txt' },
    category: String,
    documentId: { type: Schema.Types.ObjectId },
    tags: [{ type: String }],
    status: { type: String, enum: ['queued', 'processing', 'completed', 'failed', 'cancelled'], default: 'queued', index: true },
    resultText: String,
    confidence: { type: Number, min: 0, max: 100 },
    processingTimeMs: Number,
    errorMessage: String,
  },
  { timestamps: true }
);

OCRJobSchema.index({ status: 1, createdAt: -1 });
OCRJobSchema.index({ documentId: 1 });

export const OCRJob = mongoose.model<IOCRJob>('OCRJob', OCRJobSchema);
