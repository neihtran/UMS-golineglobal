import mongoose, { Schema, Document, Types } from 'mongoose';

export type PartyMemberStatus = 'active' | 'probation' | 'retired' | 'transferred' | 'expelled';

export interface IPartyMember extends Document {
  _id: Types.ObjectId;
  vienChucId?: string;
  name: string;
  dob?: Date;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  joinPartyDate?: Date;
  becomeFullMemberDate?: Date;
  status: PartyMemberStatus;
  partyPosition?: string;
  department?: string;
  cell?: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PartyMemberSchema = new Schema<IPartyMember>(
  {
    vienChucId: { type: String, index: true },
    name: { type: String, required: true, text: true },
    dob: Date,
    gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'] },
    joinPartyDate: Date,
    becomeFullMemberDate: Date,
    status: { type: String, enum: ['active', 'probation', 'retired', 'transferred', 'expelled'], default: 'active', index: true },
    partyPosition: String,
    department: String,
    cell: String,
    phone: String,
    email: { type: String, lowercase: true, trim: true },
  },
  { timestamps: true }
);

PartyMemberSchema.index({ status: 1, department: 1 });
PartyMemberSchema.index({ cell: 1 });
PartyMemberSchema.index({ name: 'text' });

export const PartyMember = mongoose.model<IPartyMember>('PartyMember', PartyMemberSchema);

export interface IPartyActivity extends Document {
  _id: Types.ObjectId;
  name: string;
  type: 'study' | 'meeting' | 'campaign' | 'donation' | 'ceremony' | 'other';
  description?: string;
  organizer?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  participants: string[];
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  result?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PartyActivitySchema = new Schema<IPartyActivity>(
  {
    name: { type: String, required: true, text: true },
    type: { type: String, enum: ['study', 'meeting', 'campaign', 'donation', 'ceremony', 'other'], default: 'other', index: true },
    description: String,
    organizer: String,
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
    location: String,
    participants: [{ type: String }],
    status: { type: String, enum: ['planned', 'ongoing', 'completed', 'cancelled'], default: 'planned', index: true },
    result: String,
  },
  { timestamps: true }
);

PartyActivitySchema.index({ type: 1, status: 1 });
PartyActivitySchema.index({ startDate: -1 });

export const PartyActivity = mongoose.model<IPartyActivity>('PartyActivity', PartyActivitySchema);
