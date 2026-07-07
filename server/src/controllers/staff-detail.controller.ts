import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { ContractHistory } from '@/models/ContractHistory.js';
import { SalaryHistory } from '@/models/SalaryHistory.js';
import { StaffTraining } from '@/models/StaffTraining.js';
import { StaffDiscipline } from '@/models/StaffDiscipline.js';
import { StaffAppointment } from '@/models/StaffAppointment.js';
import { StaffAttachment } from '@/models/StaffAttachment.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { paginationSchema } from '@/validators/hrm.validator.js';

// Contract history
export const getContractHistory = asyncHandler(async (req: Request, res: Response) => {
  const items = await ContractHistory.find({ employeeId: req.params.id }).sort({ year: -1 });
  res.json({ success: true, data: items });
});

// Contract list (all contracts with pagination)
export const getContractList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 10;

  const filter: Record<string, unknown> = {};
  if (q.search) {
    filter.$or = [
      { employeeName: { $regex: q.search, $options: 'i' } },
      { employeeCode: { $regex: q.search, $options: 'i' } },
    ];
  }
  if (q.type) filter.type = q.type;

  const [items, total] = await Promise.all([
    ContractHistory.find(filter).sort({ year: -1 }).skip((page - 1) * pageSize).limit(pageSize),
    ContractHistory.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
});

// Salary history
export const getSalaryHistory = asyncHandler(async (req: Request, res: Response) => {
  const items = await SalaryHistory.find({ employeeId: req.params.id }).sort({ date: -1 });
  res.json({ success: true, data: items });
});

// Training
export const getTraining = asyncHandler(async (req: Request, res: Response) => {
  const items = await StaffTraining.find({ employeeId: req.params.id }).sort({ year: -1 });
  res.json({ success: true, data: items });
});

// Discipline
export const getStaffDiscipline = asyncHandler(async (req: Request, res: Response) => {
  const items = await StaffDiscipline.find({ employeeId: req.params.id }).sort({ year: -1 });
  res.json({ success: true, data: items });
});

// Appointments
export const getStaffAppointments = asyncHandler(async (req: Request, res: Response) => {
  const items = await StaffAppointment.find({ employeeId: req.params.id }).sort({ effectiveDate: -1 });
  res.json({ success: true, data: items });
});

// Attachments
export const getStaffAttachments = asyncHandler(async (req: Request, res: Response) => {
  const items = await StaffAttachment.find({ employeeId: req.params.id }).sort({ date: -1 });
  res.json({ success: true, data: items });
});
