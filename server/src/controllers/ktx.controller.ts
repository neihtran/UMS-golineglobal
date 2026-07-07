import { Request, Response } from 'express';
import { Room, RoomRegistration } from '@/models/index.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';

// ─── KTX Stats ─────────────────────────────────────────────────────────────────
export const getKtxStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    total, available, occupied, maintenance, reserved,
    totalRegistrations, pendingRegs, activeRegs,
  ] = await Promise.all([
    Room.countDocuments(),
    Room.countDocuments({ status: 'available' }),
    Room.countDocuments({ status: 'occupied' }),
    Room.countDocuments({ status: 'maintenance' }),
    Room.countDocuments({ status: 'reserved' }),
    RoomRegistration.countDocuments(),
    RoomRegistration.countDocuments({ status: 'pending' }),
    RoomRegistration.countDocuments({ status: 'active' }),
  ]);

  res.json({
    success: true,
    data: {
      rooms: { total, available, occupied, maintenance, reserved },
      registrations: { total: totalRegistrations, pending: pendingRegs, active: activeRegs },
    },
  });
});

// ─── Room CRUD ─────────────────────────────────────────────────────────────────
export const getRoomList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};

  if (q.building) filter.building = q.building;
  if (q.type) filter.type = q.type;
  if (q.status) filter.status = q.status;
  if (q.minCapacity) filter.capacity = { $gte: Number(q.minCapacity) };
  if (q.search) filter.code = { $regex: q.search, $options: 'i' };

  const [rooms, total] = await Promise.all([
    Room.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { building: 1, floor: 1 }),
    Room.countDocuments(filter),
  ]);

  res.json({ success: true, data: rooms, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const getRoomById = asyncHandler(async (req: Request, res: Response) => {
  const room = await Room.findById(req.params.id);
  if (!room) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Phòng không tồn tại' } }); return; }
  res.json({ success: true, data: room });
});

export const createRoom = asyncHandler(async (req: Request, res: Response) => {
  const room = await Room.create(req.body);
  res.status(201).json({ success: true, data: room });
});

export const updateRoom = asyncHandler(async (req: Request, res: Response) => {
  const room = await Room.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!room) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Phòng không tồn tại' } }); return; }
  res.json({ success: true, data: room });
});

// ─── Registration CRUD ─────────────────────────────────────────────────────────
export const getRegistrationList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};
  if (q.studentId) filter.studentId = q.studentId;
  if (q.roomId) filter.roomId = q.roomId;
  if (q.status) filter.status = q.status;
  if (q.fromDate || q.toDate) {
    filter.startDate = {};
    if (q.fromDate) (filter.startDate as any).$gte = new Date(q.fromDate);
    if (q.toDate) (filter.startDate as any).$lte = new Date(q.toDate);
  }

  const [list, total] = await Promise.all([
    RoomRegistration.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    RoomRegistration.countDocuments(filter),
  ]);

  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const createRegistration = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  if (body.startDate) body.startDate = new Date(body.startDate);
  if (body.endDate) body.endDate = new Date(body.endDate);
  const registration = await RoomRegistration.create(body);
  res.status(201).json({ success: true, data: registration });
});

export const approveRegistration = asyncHandler(async (req: Request, res: Response) => {
  const registration = await RoomRegistration.findByIdAndUpdate(req.params.id, { $set: { status: 'active' } }, { new: true });
  if (!registration) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đăng ký không tồn tại' } }); return; }
  res.json({ success: true, data: registration });
});

export const rejectRegistration = asyncHandler(async (req: Request, res: Response) => {
  const registration = await RoomRegistration.findByIdAndUpdate(req.params.id, { $set: { status: 'rejected' } }, { new: true });
  if (!registration) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đăng ký không tồn tại' } }); return; }
  res.json({ success: true, data: registration });
});

export const getRegistrationById = asyncHandler(async (req: Request, res: Response) => {
  const registration = await RoomRegistration.findById(req.params.id);
  if (!registration) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đăng ký không tồn tại' } }); return; }
  res.json({ success: true, data: registration });
});

export const updateRegistration = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  if (body.startDate) body.startDate = new Date(body.startDate);
  if (body.endDate) body.endDate = new Date(body.endDate);
  const registration = await RoomRegistration.findByIdAndUpdate(req.params.id, { $set: body }, { new: true, runValidators: true });
  if (!registration) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đăng ký không tồn tại' } }); return; }
  res.json({ success: true, data: registration });
});

export const deleteRegistration = asyncHandler(async (req: Request, res: Response) => {
  const registration = await RoomRegistration.findByIdAndDelete(req.params.id);
  if (!registration) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Đăng ký không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã xóa đăng ký' });
});

export const deleteRoom = asyncHandler(async (req: Request, res: Response) => {
  const room = await Room.findByIdAndDelete(req.params.id);
  if (!room) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Phòng không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã xóa phòng' });
});
