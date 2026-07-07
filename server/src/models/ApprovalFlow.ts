import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IApprovalFlow extends Document {
  _id: Types.ObjectId;
  documentId: Types.ObjectId;
  step: number;
  approver?: string;
  approverName?: string;
  action?: 'pending' | 'approved' | 'rejected';
  comment?: string;
  actionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalFlowSchema = new Schema<IApprovalFlow>(
  {
    documentId: { type: Schema.Types.ObjectId }, // optional for template-level flows
    step: { type: Number }, // optional for template-level flows
    approver: String,
    approverName: String,
    action: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: String,
    actionAt: Date,
  },
  { timestamps: true }
);

ApprovalFlowSchema.index({ documentId: 1, step: 1 });

export const ApprovalFlow = mongoose.model<IApprovalFlow>('ApprovalFlow', ApprovalFlowSchema);
