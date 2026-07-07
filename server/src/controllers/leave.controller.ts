import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { LeaveRequest, VienChuc } from '@/models/index.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { z } from 'zod';

const TYPE_CONFIG: Record<string, { label: string; entitled: number; color: string }> = {
  annual: { label: 'Nghỉ phép năm', entitled: 12, color: '#16A34A' },
  sick: { label: 'Nghỉ ốm', entitled: 30, color: '#2D5D8A' },
  unpaid: { label: 'Nghỉ không lương', entitled: 0, color: '#94A3B8' },
  maternity: { label: 'Nghỉ thai sản', entitled: 180, color: '#7C3AED' },
  paternity: { label: 'Nghỉ phép cha', entitled: 5, color: '#D97706' },
  other: { label: 'Khác', entitled: 0, color: '#6B7280' },
};

const toDoc = (doc: any) => ({
  id: doc._id,
  employeeId: doc.employeeId,
  employeeName: doc.employeeName,
  departmentName: doc.departmentName,
  type: doc.type,
  typeLabel: TYPE_CONFIG[doc.type]?.label ?? doc.type,
  typeColor: TYPE_CONFIG[doc.type]?.color ?? '#6B7280',
  startDate: doc.startDate,
  endDate: doc.endDate,
  reason: doc.reason,
  days: doc.days,
  status: doc.status,
  approverName: doc.approverName,
  approvedAt: doc.approvedAt,
  rejectionReason: doc.rejectionReason,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export const getLeaveStats = asyncHandler(async (req: Request, res: Response) => {
  const year = new Date().getFullYear();
  const start = new Date(`${year}-01-01`);
  const end = new Date(`${year}-12-31`);

  const all = await LeaveRequest.find({ createdAt: { $gte: start, $lte: end } });

  const byStatus = { pending: 0, approved: 0, rejected: 0, cancelled: 0 };
  const byType: Record<string, number> = {};

  for (const r of all) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    byType[r.type] = (byType[r.type] ?? 0) + 1;
  }

  const totalDays = all
    .filter((r) => r.status === 'approved')
    .reduce((sum, r) => sum + (r.days ?? 0), 0);

  res.json({
    success: true,
    data: {
      year,
      total: all.length,
      pending: byStatus.pending,
      approved: byStatus.approved,
      rejected: byStatus.rejected,
      cancelled: byStatus.cancelled,
      byType,
      totalDaysApproved: totalDays,
    },
  });
});

export const getLeaveList = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    sortDir = 'desc',
    search,
    status,
    employeeId,
    type,
  } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (employeeId) filter.employeeId = new Types.ObjectId(employeeId);
  if (type) filter.type = type;
  if (search) {
    filter.$or = [
      { employeeName: { $regex: search, $options: 'i' } },
      { reason: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(pageSize);
  const sort: Record<string, 1 | -1> = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    LeaveRequest.find(filter).sort(sort).skip(skip).limit(Number(pageSize)).lean(),
    LeaveRequest.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items.map(toDoc),
    pagination: {
      page: Number(page),
      pageSize: Number(pageSize),
      total,
      totalPages: Math.ceil(total / Number(pageSize)),
    },
  });
});

export const getLeaveById = asyncHandler(async (req: Request, res: Response) => {
  const doc = await LeaveRequest.findById(req.params.id).lean();
  if (!doc) {
    res.status(404).json({ success: false, message: 'Không tìm thấy đơn nghỉ phép' });
    return;
  }
  res.json({ success: true, data: toDoc(doc) });
});

export const createLeave = asyncHandler(async (req: Request, res: Response) => {
  const { employeeId, type, startDate, endDate, reason } = req.body;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const employee = await VienChuc.findById(employeeId).lean();
  const employeeName = employee?.name ?? '—';
  const departmentName = employee?.department?.name ?? '';

  const doc = await LeaveRequest.create({
    employeeId: new Types.ObjectId(employeeId),
    employeeName,
    department: employee?.department,
    departmentName,
    type,
    startDate: start,
    endDate: end,
    reason,
    days,
    status: 'pending',
    createdBy: new Types.ObjectId((req as any).user?.id ?? '000000000000000000000000'),
  });

  res.status(201).json({ success: true, data: toDoc(doc.toObject()) });
});

export const updateLeave = asyncHandler(async (req: Request, res: Response) => {
  const existing = await LeaveRequest.findById(req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Không tìm thấy đơn nghỉ phép' });
    return;
  }

  const { type, startDate, endDate, reason, status, rejectionReason } = req.body;
  const updates: Record<string, unknown> = {};

  if (type !== undefined) updates.type = type;
  if (reason !== undefined) updates.reason = reason;
  if (rejectionReason !== undefined) updates.rejectionReason = rejectionReason;
  if (status !== undefined) updates.status = status;

  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : existing.startDate;
    const end = endDate ? new Date(endDate) : existing.endDate;
    updates.startDate = start;
    updates.endDate = end;
    updates.days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  const doc = await LeaveRequest.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true }).lean();
  res.json({ success: true, data: toDoc(doc) });
});

export const approveLeave = asyncHandler(async (req: Request, res: Response) => {
  const doc = await LeaveRequest.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        status: 'approved',
        approvedAt: new Date(),
        approverName: (req as any).user?.displayName ?? 'Admin',
      },
    },
    { new: true, runValidators: true }
  ).lean();

  if (!doc) {
    res.status(404).json({ success: false, message: 'Không tìm thấy đơn nghỉ phép' });
    return;
  }
  res.json({ success: true, data: toDoc(doc) });
});

export const rejectLeave = asyncHandler(async (req: Request, res: Response) => {
  const { rejectionReason } = req.body ?? {};
  const doc = await LeaveRequest.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        status: 'rejected',
        rejectionReason: rejectionReason ?? '',
        approverName: (req as any).user?.displayName ?? 'Admin',
      },
    },
    { new: true, runValidators: true }
  ).lean();

  if (!doc) {
    res.status(404).json({ success: false, message: 'Không tìm thấy đơn nghỉ phép' });
    return;
  }
  res.json({ success: true, data: toDoc(doc) });
});

export const deleteLeave = asyncHandler(async (req: Request, res: Response) => {
  const doc = await LeaveRequest.findByIdAndDelete(req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Không tìm thấy đơn nghỉ phép' });
    return;
  }
  res.json({ success: true, message: 'Đã xóa đơn nghỉ phép' });
});
