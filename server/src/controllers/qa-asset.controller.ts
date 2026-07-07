import { Request, Response } from 'express';
import { QAAsset, QAAssetMaintenance, Evidence, Assessment } from '@/models/index.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { idParamSchema } from '@/validators/shared.validator.js';
import { validate } from '@/middleware/validate.middleware.js';

// ─── Asset CRUD ────────────────────────────────────────────────────────────────
export const getQaAssetList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 10;
  const filter: Record<string, unknown> = {};
  if (q.status) filter.status = q.status;
  if (q.category) filter.category = q.category;
  if (q.search) filter.$or = [
    { code: { $regex: q.search, $options: 'i' } },
    { name: { $regex: q.search, $options: 'i' } },
  ];

  const [list, total] = await Promise.all([
    QAAsset.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    QAAsset.countDocuments(filter),
  ]);
  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const getQaAssetById = asyncHandler(async (req: Request, res: Response) => {
  const asset = await QAAsset.findById(req.params.id);
  if (!asset) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tài sản không tồn tại' } }); return; }
  res.json({ success: true, data: asset });
});

export const createQaAsset = asyncHandler(async (req: Request, res: Response) => {
  const asset = await QAAsset.create(req.body);
  res.status(201).json({ success: true, data: asset });
});

export const updateQaAsset = asyncHandler(async (req: Request, res: Response) => {
  const asset = await QAAsset.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!asset) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tài sản không tồn tại' } }); return; }
  res.json({ success: true, data: asset });
});

export const deleteQaAsset = asyncHandler(async (req: Request, res: Response) => {
  await QAAsset.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Đã xóa tài sản' });
});

export const getQaAssetDepreciation = asyncHandler(async (req: Request, res: Response) => {
  const asset = await QAAsset.findById(req.params.id).select('name value purchaseDate depreciation');
  if (!asset) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tài sản không tồn tại' } }); return; }

  const purchaseYear = new Date(asset.purchaseDate).getFullYear();
  const usefulLife = 6;
  const annualDepreciation = Math.round(asset.value / usefulLife);
  const years: { year: number; bookValue: number; depreciation: number }[] = [];
  let remainingValue = asset.value;
  for (let i = 0; i <= usefulLife; i++) {
    years.push({ year: purchaseYear + i, bookValue: Math.max(0, remainingValue), depreciation: i === 0 ? 0 : annualDepreciation });
    remainingValue = Math.max(0, remainingValue - annualDepreciation);
  }
  res.json({ success: true, data: { asset: { name: asset.name, value: asset.value, purchaseDate: asset.purchaseDate }, years } });
});

// ─── Maintenance Log ───────────────────────────────────────────────────────────
export const getQaAssetMaintenance = asyncHandler(async (req: Request, res: Response) => {
  const logs = await QAAssetMaintenance.find({ assetId: req.params.id }).sort({ date: -1 }).limit(20);
  res.json({ success: true, data: logs });
});

export const createQaAssetMaintenance = asyncHandler(async (req: Request, res: Response) => {
  const log = await QAAssetMaintenance.create({ ...req.body, assetId: req.params.id });
  res.status(201).json({ success: true, data: log });
});

// ─── Facility / CSVC ──────────────────────────────────────────────────────────
export interface IQAFacility extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  type: string;
  capacity: number;
  currentUsage: number;
  floor: string;
  building: string;
  area: number;
  equipment: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  condition: 'good' | 'fair' | 'needs_repair';
  lastInspected: Date;
  nextInspection: Date;
  supervisor: string;
  supervisorPhone: string;
  features: string[];
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QAFacilitySchema = new Schema<IQAFacility>({
  code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, text: true },
  type: { type: String, required: true, index: true },
  capacity: { type: Number, required: true, min: 0 },
  currentUsage: { type: Number, default: 0, min: 0 },
  floor: { type: String },
  building: { type: String },
  area: { type: Number },
  equipment: { type: Number, default: 0 },
  status: { type: String, enum: ['available', 'occupied', 'maintenance', 'reserved'], default: 'available', index: true },
  condition: { type: String, enum: ['good', 'fair', 'needs_repair'], default: 'good' },
  lastInspected: { type: Date },
  nextInspection: { type: Date },
  supervisor: { type: String },
  supervisorPhone: { type: String },
  features: [{ type: String }],
  note: String,
}, { timestamps: true });

QAFacilitySchema.index({ status: 1, condition: 1 });
export const QAFacility = mongoose.model<IQAFacility>('QAFacility', QAFacilitySchema);

export const getQaFacilityList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 10;
  const filter: Record<string, unknown> = {};
  if (q.status) filter.status = q.status;
  if (q.condition) filter.condition = q.condition;
  if (q.type) filter.type = q.type;
  if (q.search) filter.$or = [
    { code: { $regex: q.search, $options: 'i' } },
    { name: { $regex: q.search, $options: 'i' } },
  ];

  const [list, total] = await Promise.all([
    QAFacility.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    QAFacility.countDocuments(filter),
  ]);
  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const getQaFacilityById = asyncHandler(async (req: Request, res: Response) => {
  const f = await QAFacility.findById(req.params.id);
  if (!f) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CSVC không tồn tại' } }); return; }
  res.json({ success: true, data: f });
});

export const createQaFacility = asyncHandler(async (req: Request, res: Response) => {
  const facility = await QAFacility.create(req.body);
  res.status(201).json({ success: true, data: facility });
});

export const updateQaFacility = asyncHandler(async (req: Request, res: Response) => {
  const facility = await QAFacility.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!facility) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CSVC không tồn tại' } }); return; }
  res.json({ success: true, data: facility });
});

export const deleteQaFacility = asyncHandler(async (req: Request, res: Response) => {
  await QAFacility.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Đã xóa CSVC' });
});
