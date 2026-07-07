import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { VienChuc, Department } from '@/models/index.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import type {
  CreateVienChucInput,
  UpdateVienChucInput,
  VienChucQueryInput,
} from '@/validators/hrm.validator.js';

// ─── VienChuc CRUD ────────────────────────────────────────────────────────────────

export const getVienChucList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as unknown as VienChucQueryInput;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 10;

  const filter: Record<string, unknown> = {};
  if (q.status) filter.status = q.status;
  if (q.department) filter.department = new Types.ObjectId(q.department);
  if (q.contractType) filter.contractType = q.contractType;
  if (q.search) {
    filter.$or = [
      { name: { $regex: q.search, $options: 'i' } },
      { code: { $regex: q.search, $options: 'i' } },
      { email: { $regex: q.search, $options: 'i' } },
    ];
  }

  const [data, total] = await Promise.all([
    VienChuc.find(filter)
      .populate('department', 'name code shortName')
      .populate('supervisor', 'displayName')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    VienChuc.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
});

export const getVienChucById = asyncHandler(async (req: Request, res: Response) => {
  const vc = await VienChuc.findById(req.params.id)
    .select('-cccd')
    .populate('department', 'name code shortName type')
    .populate('supervisor', 'displayName email phone')
    .populate('user', 'email username role status');

  if (!vc) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Viên chức không tồn tại' },
    });
    return;
  }

  res.json({ success: true, data: vc });
});

export const createVienChuc = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as CreateVienChucInput;

  // Check unique code
  const existing = await VienChuc.findOne({ code: body.code });
  if (existing) {
    res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: 'Mã viên chức đã tồn tại' },
    });
    return;
  }

  const createData: Record<string, unknown> = {
    ...body,
    createdBy: req.user?._id,
    updatedBy: req.user?._id,
  };

  if (body.department) createData.department = new Types.ObjectId(body.department);

  const vc = await VienChuc.create(createData);

  const saved = await VienChuc.findById(vc._id)
    .select('-cccd')
    .populate('department', 'name code shortName');

  res.status(201).json({ success: true, data: saved });
});

export const updateVienChuc = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as UpdateVienChucInput;
  const updates: Record<string, unknown> = {
    ...body,
    updatedBy: req.user?._id,
  };

  if (body.department) updates.department = new Types.ObjectId(body.department as string);
  if (body.department === null || body.department === '') updates.department = null;

  const vc = await VienChuc.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  )
    .select('-cccd')
    .populate('department', 'name code shortName')
    .populate('supervisor', 'displayName');

  if (!vc) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Viên chức không tồn tại' },
    });
    return;
  }

  res.json({ success: true, data: vc });
});

export const deleteVienChuc = asyncHandler(async (req: Request, res: Response) => {
  const vc = await VienChuc.findByIdAndUpdate(
    req.params.id,
    { $set: { status: 'inactive', updatedBy: req.user?._id } },
    { new: true }
  );

  if (!vc) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Viên chức không tồn tại' },
    });
    return;
  }

  res.json({ success: true, message: 'Đã xóa viên chức' });
});

// ─── HRM Stats ─────────────────────────────────────────────────────────────────

export const getHrmStats = asyncHandler(async (req: Request, res: Response) => {
  const [
    total,
    active,
    trial,
    onLeave,
    inactive,
    byDepartment,
    byContractType,
    expiringContracts,
  ] = await Promise.all([
    VienChuc.countDocuments(),
    VienChuc.countDocuments({ status: 'active' }),
    VienChuc.countDocuments({ status: 'trial' }),
    VienChuc.countDocuments({ status: 'leave' }),
    VienChuc.countDocuments({ status: 'inactive' }),
    VienChuc.aggregate([
      { $match: { status: { $ne: 'inactive' } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$dept.name', 'Chưa phân'] }, count: 1 } },
      { $sort: { count: -1 } },
    ]),
    VienChuc.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$contractType', count: { $sum: 1 } } },
      { $project: { type: '$_id', count: 1 } },
    ]),
    // Contracts expiring in next 30 days
    VienChuc.countDocuments({
      status: { $in: ['active', 'trial'] },
      contractEndDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      total,
      byStatus: { active, trial, onLeave, inactive },
      byDepartment,
      byContractType,
      expiringContractsThisMonth: expiringContracts,
    },
  });
});

// ─── HRM Monthly Trend ──────────────────────────────────────────────────────────

export const getHrmMonthlyTrend = asyncHandler(async (_req: Request, res: Response) => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const trend = await VienChuc.aggregate([
    { $match: { createdAt: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const labels: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const counts = labels.map((label) => {
    const [y, m] = label.split('-').map(Number);
    const found = trend.find((t) => t._id.year === y && t._id.month === m);
    return found ? found.count : 0;
  });

  res.json({
    success: true,
    data: labels.map((label, i) => ({ month: label, count: counts[i] })),
  });
});
