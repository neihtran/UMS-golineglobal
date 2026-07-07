import { Request, Response } from 'express';
import { Appointment } from '@/models/Appointment.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';

export const getAppointments = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 10;

  const filter: Record<string, unknown> = {};
  if (q.employeeId) filter.employeeId = q.employeeId;
  if (q.type) filter.type = q.type;
  if (q.status) filter.status = q.status;
  if (q.search) {
    filter.$text = { $search: q.search };
  }

  const [items, total] = await Promise.all([
    Appointment.find(filter)
      .populate('employeeId', 'name email code')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ fromDate: -1 }),
    Appointment.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
});

export const getAppointmentStats = asyncHandler(async (req: Request, res: Response) => {
  const [total, byStatus, byType, byMonth] = await Promise.all([
    Appointment.countDocuments(),
    Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1 } },
    ]),
    Appointment.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $project: { type: '$_id', count: 1 } },
    ]),
    Appointment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$fromDate' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 6 },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      total,
      byStatus,
      byType,
      byMonth: byMonth.map((m) => ({ month: m._id, count: m.count })),
    },
  });
});

export const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
  const item = await Appointment.findById(req.params.id).populate('employeeId', 'name email code');
  if (!item) return res.status(404).json({ success: false, error: { message: 'Không tìm thấy' } });
  res.json({ success: true, data: item });
});

export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const item = await Appointment.create(req.body);
  res.status(201).json({ success: true, data: item });
});

export const updateAppointment = asyncHandler(async (req: Request, res: Response) => {
  const item = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('employeeId', 'name email code');
  if (!item) return res.status(404).json({ success: false, error: { message: 'Không tìm thấy' } });
  res.json({ success: true, data: item });
});

export const deleteAppointment = asyncHandler(async (req: Request, res: Response) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Đã xóa' });
});
