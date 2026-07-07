import { Request, Response } from 'express';
import { SalarySheet } from '@/models/SalarySheet.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';

export const getSalarySheets = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 10;

  const filter: Record<string, unknown> = {};
  if (q.month) filter.month = q.month;
  if (q.status) filter.status = q.status;
  if (q.search) {
    filter.$or = [
      { employeeName: { $regex: q.search, $options: 'i' } },
      { employeeCode: { $regex: q.search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    SalarySheet.find(filter)
      .populate('employeeId', 'name email code')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 }),
    SalarySheet.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
});

export const getSalaryStats = asyncHandler(async (req: Request, res: Response) => {
  const { month } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (month) filter.month = month;

  const [totalSheets, paidCount, draftCount, items] = await Promise.all([
    SalarySheet.countDocuments(filter),
    SalarySheet.countDocuments({ ...filter, status: 'paid' }),
    SalarySheet.countDocuments({ ...filter, status: 'draft' }),
    SalarySheet.find(filter).populate('employeeId', 'name email code'),
  ]);

  const monthlyData = items.reduce((acc: Record<string, { total: number; bonus: number }>, sheet) => {
    const m = sheet.month || 'Khác';
    if (!acc[m]) acc[m] = { total: 0, bonus: 0 };
    acc[m].total += (sheet.baseSalary || 0) + (sheet.allowances || 0) - (sheet.deductions || 0);
    acc[m].bonus += sheet.bonus || 0;
    return acc;
  }, {});

  const totalFund = items.reduce((s, p) => s + (p.baseSalary || 0) + (p.allowances || 0) + (p.bonus || 0) - (p.deductions || 0), 0);

  res.json({
    success: true,
    data: {
      totalStaff: totalSheets,
      paidCount,
      draftCount,
      totalFund,
      monthlyData: Object.entries(monthlyData)
        .map(([month, values]) => ({ month, ...values }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6),
    },
  });
});

export const getSalarySheetById = asyncHandler(async (req: Request, res: Response) => {
  const item = await SalarySheet.findById(req.params.id).populate('employeeId', 'name email code');
  if (!item) return res.status(404).json({ success: false, error: { message: 'Không tìm thấy' } });
  res.json({ success: true, data: item });
});

export const createSalarySheet = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  body.netSalary = (body.baseSalary || 0) + (body.allowances || 0) + (body.bonus || 0) - (body.deductions || 0);
  const item = await SalarySheet.create(body);
  res.status(201).json({ success: true, data: item });
});

export const updateSalarySheet = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  body.netSalary = (body.baseSalary || 0) + (body.allowances || 0) + (body.bonus || 0) - (body.deductions || 0);
  const item = await SalarySheet.findByIdAndUpdate(req.params.id, body, { new: true }).populate('employeeId', 'name email code');
  if (!item) return res.status(404).json({ success: false, error: { message: 'Không tìm thấy' } });
  res.json({ success: true, data: item });
});

export const deleteSalarySheet = asyncHandler(async (req: Request, res: Response) => {
  await SalarySheet.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Đã xóa' });
});
