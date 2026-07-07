import mongoose, { Schema, Document, Types } from 'mongoose';

export type AssetStatus = 'active' | 'maintenance' | 'broken' | 'disposed';

export interface IQAAsset extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  category: string;
  department?: Types.ObjectId;
  departmentName?: string;
  quantity: number;
  unit: string;
  value: number;
  status: AssetStatus;
  depreciation: number;
  location: string;
  supplier: string;
  purchaseDate: Date;
  warranty: Date;
  assignee?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QAAssetSchema = new Schema<IQAAsset>(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, text: true },
    category: { type: String, required: true, index: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    departmentName: { type: String },
    quantity: { type: Number, default: 1, min: 0 },
    unit: { type: String, default: 'bộ' },
    value: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['active', 'maintenance', 'broken', 'disposed'], default: 'active', index: true },
    depreciation: { type: Number, default: 0, min: 0, max: 100 },
    location: { type: String },
    supplier: { type: String },
    purchaseDate: { type: Date },
    warranty: { type: Date },
    assignee: { type: String },
    note: String,
  },
  { timestamps: true }
);

QAAssetSchema.index({ category: 1, status: 1 });

export const QAAsset = mongoose.model<IQAAsset>('QAAsset', QAAssetSchema);

export interface IQAAssetMaintenance extends Document {
  _id: Types.ObjectId;
  assetId: Types.ObjectId;
  type: 'maintenance' | 'repair' | 'inspection' | 'software_update';
  date: Date;
  cost: number;
  note: string;
  vendor: string;
  result: string;
  performedBy?: string;
  createdAt: Date;
}

const QAAssetMaintenanceSchema = new Schema<IQAAssetMaintenance>(
  {
    assetId: { type: Schema.Types.ObjectId, ref: 'QAAsset', required: true, index: true },
    type: { type: String, enum: ['maintenance', 'repair', 'inspection', 'software_update'], required: true },
    date: { type: Date, required: true, default: Date.now },
    cost: { type: Number, default: 0, min: 0 },
    note: { type: String, required: true },
    vendor: { type: String, required: true },
    result: { type: String, required: true },
    performedBy: { type: String },
  },
  { timestamps: true }
);

QAAssetMaintenanceSchema.index({ assetId: 1, date: -1 });

export const QAAssetMaintenance = mongoose.model<IQAAssetMaintenance>('QAAssetMaintenance', QAAssetMaintenanceSchema);
