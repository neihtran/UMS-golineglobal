import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── StudentLog (Nhật ký sinh viên) ──────────────────────────────────────────
// Lưu nhật ký các sự kiện nghiệp vụ liên quan đến sinh viên

export type StudentLogAction =
  | 'CREATED'
  | 'UPDATED'
  | 'ENROLLED'
  | 'CANCELLED'
  | 'GRADE_ENTERED'
  | 'GRADE_LOCKED'
  | 'CLASS_CHANGED'
  | 'MAJOR_CHANGED'
  | 'RESERVATION_STARTED'
  | 'RESERVATION_ENDED'
  | 'DROPPED'
  | 'TRANSFERRED'
  | 'GRADUATED'
  | 'WARNING_ISSUED'
  | 'WARNING_RESOLVED';

export interface IStudentLog extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;             // Ref: Student
  action: StudentLogAction;
  referenceType?: string;              // VD: 'Enrollment', 'Grade', 'Graduation'
  referenceId?: Types.ObjectId;
  description: string;
  metadata?: Record<string, any>;       // Dữ liệu bổ sung dạng JSON
  ip?: string;
  userAgent?: string;
  createdBy?: Types.ObjectId;          // Ref: User (nullable for system actions)
  createdAt: Date;
}

const StudentLogSchema = new Schema<IStudentLog>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    action: {
      type: String,
      enum: [
        'CREATED',
        'UPDATED',
        'ENROLLED',
        'CANCELLED',
        'GRADE_ENTERED',
        'GRADE_LOCKED',
        'CLASS_CHANGED',
        'MAJOR_CHANGED',
        'RESERVATION_STARTED',
        'RESERVATION_ENDED',
        'DROPPED',
        'TRANSFERRED',
        'GRADUATED',
        'WARNING_ISSUED',
        'WARNING_RESOLVED',
      ],
      required: true,
    },
    referenceType: {
      type: String,
      trim: true,
    },
    referenceId: Types.ObjectId,
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ip: String,
    userAgent: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Indexes
StudentLogSchema.index({ student: 1, createdAt: -1 });
StudentLogSchema.index({ action: 1, createdAt: -1 });
StudentLogSchema.index({ referenceType: 1, referenceId: 1 });

export const StudentLog = mongoose.model<IStudentLog>('StudentLog', StudentLogSchema);

// Helper function to create log entry
export async function createStudentLog(
  studentId: string,
  action: StudentLogAction,
  description: string,
  options?: {
    referenceType?: string;
    referenceId?: string;
    metadata?: Record<string, any>;
    createdBy?: string;
    ip?: string;
    userAgent?: string;
  }
): Promise<IStudentLog> {
  return StudentLog.create({
    student: new Types.ObjectId(studentId),
    action,
    description,
    referenceType: options?.referenceType,
    referenceId: options?.referenceId ? new Types.ObjectId(options.referenceId) : undefined,
    metadata: options?.metadata,
    createdBy: options?.createdBy ? new Types.ObjectId(options.createdBy) : undefined,
    ip: options?.ip,
    userAgent: options?.userAgent,
  });
}
