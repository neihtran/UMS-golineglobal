import mongoose, { Schema, Document, Types } from 'mongoose';

export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';
export type RoomType = '4_bed' | '6_bed' | '8_bed' | 'single' | 'double';

export interface IRoom extends Document {
  _id: Types.ObjectId;
  code: string;
  building: string;
  floor: number;
  roomNumber: string;
  type: RoomType;
  capacity: number;
  currentOccupancy: number;
  monthlyFee?: number;
  status: RoomStatus;
  amenities: string[];
  notes?: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    code: { type: String, unique: true, required: true, index: true },
    building: { type: String, required: true, index: true },
    floor: { type: Number, required: true },
    roomNumber: { type: String, required: true },
    type: { type: String, enum: ['4_bed', '6_bed', '8_bed', 'single', 'double'], default: '6_bed' },
    capacity: { type: Number, required: true, min: 1, max: 20 },
    currentOccupancy: { type: Number, default: 0, min: 0 },
    monthlyFee: Number,
    status: { type: String, enum: ['available', 'occupied', 'maintenance', 'reserved'], default: 'available', index: true },
    amenities: [{ type: String }],
    notes: String,
    images: [{ type: String }],
  },
  { timestamps: true }
);

RoomSchema.index({ building: 1, status: 1 });
RoomSchema.index({ type: 1, capacity: 1 });

export const Room = mongoose.model<IRoom>('Room', RoomSchema);
