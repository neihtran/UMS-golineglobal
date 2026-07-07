import { Request, Response } from 'express';
import { Tuition, Expenditure } from '@/models/index.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';

// ─── FIN Stats ─────────────────────────────────────────────────────────────────
export const getFinStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    totalTuition, paid, unpaid, overdue,
    totalExpenditure, approvedExpenditure, pendingExpenditure,
    revenueBySemester,
    expenseByCategory,
  ] = await Promise.all([
    Tuition.countDocuments(),
    Tuition.countDocuments({ status: 'paid' }),
    Tuition.countDocuments({ status: { $in: ['unpaid', 'partial'] } }),
    Tuition.countDocuments({ status: 'overdue' }),
    Expenditure.countDocuments(),
    Expenditure.countDocuments({ status: 'approved' }),
    Expenditure.countDocuments({ status: 'pending' }),
    Tuition.aggregate([
      { $group: { _id: { semester: '$semester', year: '$academicYear' }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': -1, '_id.semester': -1 } },
      { $limit: 8 },
    ]),
    Expenditure.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      tuition: { total: totalTuition, paid, unpaid, overdue },
      expenditure: { total: totalExpenditure, approved: approvedExpenditure, pending: pendingExpenditure },
      revenueBySemester,
      expenseByCategory,
    },
  });
});

// ─── Tuition CRUD ──────────────────────────────────────────────────────────────
export const getTuitionList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};

  if (q.studentId) filter.studentId = q.studentId;
  if (q.studentName) filter.studentName = { $regex: q.studentName, $options: 'i' };
  if (q.semester) filter.semester = q.semester;
  if (q.academicYear) filter.academicYear = q.academicYear;
  if (q.status) filter.status = q.status;
  if (q.fromAmount !== undefined) filter.amount = { ...(filter.amount as any), $gte: Number(q.fromAmount) };
  if (q.toAmount !== undefined) filter.amount = { ...(filter.amount as any), $lte: Number(q.toAmount) };

  const [list, total] = await Promise.all([
    Tuition.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    Tuition.countDocuments(filter),
  ]);

  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const createTuition = asyncHandler(async (req: Request, res: Response) => {
  const tuition = await Tuition.create(req.body);
  res.status(201).json({ success: true, data: tuition });
});

export const updateTuition = asyncHandler(async (req: Request, res: Response) => {
  const tuition = await Tuition.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!tuition) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Học phí không tồn tại' } }); return; }
  res.json({ success: true, data: tuition });
});

export const getTuitionById = asyncHandler(async (req: Request, res: Response) => {
  const tuition = await Tuition.findById(req.params.id);
  if (!tuition) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Học phí không tồn tại' } }); return; }
  res.json({ success: true, data: tuition });
});

export const deleteTuition = asyncHandler(async (req: Request, res: Response) => {
  const tuition = await Tuition.findByIdAndDelete(req.params.id);
  if (!tuition) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Học phí không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã xóa học phí' });
});

// ─── Expenditure CRUD ──────────────────────────────────────────────────────────
export const getExpenditureList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};

  if (q.department) filter.department = q.department;
  if (q.category) filter.category = q.category;
  if (q.status) filter.status = q.status;
  if (q.fromDate || q.toDate) {
    filter.requestDate = {};
    if (q.fromDate) (filter.requestDate as any).$gte = new Date(q.fromDate);
    if (q.toDate) (filter.requestDate as any).$lte = new Date(q.toDate);
  }
  if (q.minAmount !== undefined) filter.amount = { ...(filter.amount as any), $gte: Number(q.minAmount) };
  if (q.maxAmount !== undefined) filter.amount = { ...(filter.amount as any), $lte: Number(q.maxAmount) };

  const [list, total] = await Promise.all([
    Expenditure.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { requestDate: -1 }),
    Expenditure.countDocuments(filter),
  ]);

  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const createExpenditure = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  if (body.requestDate) body.requestDate = new Date(body.requestDate);
  const expenditure = await Expenditure.create(body);
  res.status(201).json({ success: true, data: expenditure });
});

export const approveExpenditure = asyncHandler(async (req: Request, res: Response) => {
  const expenditure = await Expenditure.findByIdAndUpdate(req.params.id, { $set: { status: 'approved', approver: req.user?.displayName, approveDate: new Date() } }, { new: true });
  if (!expenditure) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Khoản chi không tồn tại' } }); return; }
  res.json({ success: true, data: expenditure });
});

export const updateExpenditure = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  if (body.requestDate) body.requestDate = new Date(body.requestDate);
  const expenditure = await Expenditure.findByIdAndUpdate(req.params.id, { $set: body }, { new: true, runValidators: true });
  if (!expenditure) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Khoản chi không tồn tại' } }); return; }
  res.json({ success: true, data: expenditure });
});

export const getExpenditureById = asyncHandler(async (req: Request, res: Response) => {
  const expenditure = await Expenditure.findById(req.params.id);
  if (!expenditure) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Khoản chi không tồn tại' } }); return; }
  res.json({ success: true, data: expenditure });
});

export const deleteExpenditure = asyncHandler(async (req: Request, res: Response) => {
  const expenditure = await Expenditure.findByIdAndDelete(req.params.id);
  if (!expenditure) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Khoản chi không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã xóa khoản chi' });
});
