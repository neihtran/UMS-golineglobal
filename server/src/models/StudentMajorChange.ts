import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── StudentMajorChange (Chuyển ngành) ────────────────────────────────────────
// Lưu lịch sử chuyển ngành

export interface IStudentMajorChange extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;             // Ref: Student
  fromMajor: Types.ObjectId;          // Ref: Major (ngành cũ)
  toMajor: Types.ObjectId;            // Ref: Major (ngành mới)
  fromSpecialization?: Types.ObjectId; // Ref: Specialization (chuyên ngành cũ)
  toSpecialization?: Types.ObjectId;   // Ref: Specialization (chuyên ngành mới)
  fromTrainingSystem?: Types.ObjectId; // Ref: TrainingSystem (hệ cũ)
  toTrainingSystem?: Types.ObjectId;   // Ref: TrainingSystem (hệ mới)
  effectiveDate: Date;
  decisionNo?: string;
  decisionDate?: Date;
  reason?: string;
  curriculumFrom?: Types.ObjectId;     // Ref: Curriculum (chương trình cũ)
  curriculumTo?: Types.ObjectId;       // Ref: Curriculum (chương trình mới)
  status: 'pending' | 'approved' | 'cancelled';
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  note?: string;
  createdBy: Types.ObjectId;          // Ref: User
  createdAt: Date;
  updatedAt: Date;
}

const StudentMajorChangeSchema = new Schema<IStudentMajorChange>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    fromMajor: {
      type: Schema.Types.ObjectId,
      ref: 'Major',
      required: true,
    },
    toMajor: {
      type: Schema.Types.ObjectId,
      ref: 'Major',
      required: true,
    },
    fromSpecialization: {
      type: Schema.Types.ObjectId,
      ref: 'Specialization',
    },
    toSpecialization: {
      type: Schema.Types.ObjectId,
      ref: 'Specialization',
    },
    fromTrainingSystem: {
      type: Schema.Types.ObjectId,
      ref: 'TrainingSystem',
    },
    toTrainingSystem: {
      type: Schema.Types.ObjectId,
      ref: 'TrainingSystem',
    },
    effectiveDate: Date,
    decisionNo: String,
    decisionDate: Date,
    reason: String,
    curriculumFrom: {
      type: Schema.Types.ObjectId,
      ref: 'Curriculum',
    },
    curriculumTo: {
      type: Schema.Types.ObjectId,
      ref: 'Curriculum',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'cancelled'],
      default: 'pending',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
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
StudentMajorChangeSchema.index({ student: 1, status: 1 });
StudentMajorChangeSchema.index({ fromMajor: 1, toMajor: 1 });

export const StudentMajorChange = mongoose.model<IStudentMajorChange>('StudentMajorChange', StudentMajorChangeSchema);
