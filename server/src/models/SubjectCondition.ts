import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── SubjectCondition (Điều kiện đăng ký) ─────────────────────────────────────
// Điều kiện đăng ký ngoài tiên quyết

export interface ISubjectCondition extends Document {
  _id: Types.ObjectId;
  subject: Types.ObjectId;              // Ref: Subject
  minGpa?: number;                    // GPA tối thiểu để đăng ký (0-4.0)
  minCompletedCredit?: number;        // Số tín chỉ đã tích lũy tối thiểu
  maxFailedSubject?: number;          // Số môn nợ tối đa cho phép
  requiredSubjects?: Types.ObjectId[]; // Các môn phải đạt trước
  maxConcurrentSubject?: number;       // Số môn tối đa đăng ký cùng lúc
  note?: string;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectConditionSchema = new Schema<ISubjectCondition>(
  {
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    minGpa: {
      type: Number,
      min: 0,
      max: 4.0,
    },
    minCompletedCredit: {
      type: Number,
      min: 0,
    },
    maxFailedSubject: {
      type: Number,
      min: 0,
    },
    requiredSubjects: {
      type: [Schema.Types.ObjectId],
      ref: 'Subject',
      default: [],
    },
    maxConcurrentSubject: {
      type: Number,
      min: 1,
    },
    note: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Each subject can only have one condition record
SubjectConditionSchema.index({ subject: 1 }, { unique: true });

export const SubjectCondition = mongoose.model<ISubjectCondition>('SubjectCondition', SubjectConditionSchema);
