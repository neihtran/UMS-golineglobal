import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── StudentClassChange (Chuyển lớp) ─────────────────────────────────────────
// Lưu lịch sử chuyển lớp hành chính

export interface IStudentClassChange extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;             // Ref: Student
  fromClass: Types.ObjectId;          // Ref: StudentClass (lớp cũ)
  toClass: Types.ObjectId;            // Ref: StudentClass (lớp mới)
  effectiveDate: Date;
  decisionNo?: string;
  decisionDate?: Date;
  reason?: string;
  note?: string;
  createdBy: Types.ObjectId;          // Ref: User
  createdAt: Date;
  updatedAt: Date;
}

const StudentClassChangeSchema = new Schema<IStudentClassChange>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    fromClass: {
      type: Schema.Types.ObjectId,
      ref: 'StudentClass',
      required: true,
    },
    toClass: {
      type: Schema.Types.ObjectId,
      ref: 'StudentClass',
      required: true,
    },
    effectiveDate: Date,
    decisionNo: String,
    decisionDate: Date,
    reason: String,
    note: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes
StudentClassChangeSchema.index({ student: 1 });
StudentClassChangeSchema.index({ fromClass: 1, toClass: 1 });

export const StudentClassChange = mongoose.model<IStudentClassChange>('StudentClassChange', StudentClassChangeSchema);
