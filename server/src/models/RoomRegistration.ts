import mongoose, { Schema, Document, Types } from 'mongoose';

export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';

export interface IRoomRegistration extends Document {
  _id: Types.ObjectId;
  studentId: string;
  studentName?: string;
  roomId: string;
  roomCode?: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  note?: string;
  status: RegistrationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const RoomRegistrationSchema = new Schema<IRoomRegistration>(
  {
    studentId: { type: String, required: true, index: true },
    studentName: String,
    roomId: { type: String, required: true, index: true },
    roomCode: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: String,
    note: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'], default: 'pending', index: true },
  },
  { timestamps: true }
);

RoomRegistrationSchema.index({ studentId: 1, status: 1 });
RoomRegistrationSchema.index({ roomId: 1, startDate: 1 });

export const RoomRegistration = mongoose.model<IRoomRegistration>('RoomRegistration', RoomRegistrationSchema);
