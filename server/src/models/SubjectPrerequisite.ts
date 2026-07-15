import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── SubjectPrerequisite (Môn tiên quyết) ─────────────────────────────────────
// Quản lý điều kiện tiên quyết/song hành

export type PrerequisiteType = 'prerequisite' | 'corequisite';

export interface ISubjectPrerequisite extends Document {
  _id: Types.ObjectId;
  subject: Types.ObjectId;           // Ref: Subject (môn học)
  prerequisite: Types.ObjectId;      // Ref: Subject (môn tiên quyết)
  type: PrerequisiteType;            // 'prerequisite' = phải học trước, 'corequisite' = có thể học cùng lúc
  note?: string;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectPrerequisiteSchema = new Schema<ISubjectPrerequisite>(
  {
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    prerequisite: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['prerequisite', 'corequisite'],
      required: true,
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

// Compound unique: mỗi cặp subject-prerequisite chỉ có 1 bản ghi
SubjectPrerequisiteSchema.index({ subject: 1, prerequisite: 1 }, { unique: true });

// Validate: không cho A là tiên quyết của chính A
SubjectPrerequisiteSchema.pre('save', function (next) {
  if (this.subject.toString() === this.prerequisite.toString()) {
    next(new Error('Môn học không thể là tiên quyết của chính nó'));
    return;
  }
  next();
});

export const SubjectPrerequisite = mongoose.model<ISubjectPrerequisite>('SubjectPrerequisite', SubjectPrerequisiteSchema);
