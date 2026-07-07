import { Schema, model, Types } from 'mongoose';

export interface IStaffAttachment extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  employeeName?: string;
  employeeCode?: string;
  name: string;
  type: string;
  size: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StaffAttachmentSchema = new Schema<IStaffAttachment>({
  employeeId: { type: Types.ObjectId, ref: 'User', required: true },
  employeeName: { type: String },
  employeeCode: { type: String },
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: String, required: true },
  date: { type: Date, required: true },
});

StaffAttachmentSchema.index({ employeeId: 1, date: -1 });

export const StaffAttachment = model<IStaffAttachment>('StaffAttachment', StaffAttachmentSchema);
export type { IStaffAttachment };
