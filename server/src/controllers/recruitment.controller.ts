import { Request, Response } from 'express';
import { Recruitment } from '@/models/Recruitment.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { buildMongooseQuery } from '@/types/api.types.js';

export const getRecruitmentList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const { filter: baseFilter, pagination } = buildMongooseQuery({
    page: Number(q.page) || 1,
    pageSize: Number(q.pageSize) || 10,
    sortBy: q.sortBy || 'createdAt',
    sortDir: q.sortDir || 'desc',
  });

  const filter: Record<string, unknown> = { ...baseFilter };
  delete (filter as any).page;
  delete (filter as any).pageSize;

  if (q.status) filter.status = q.status;
  if (q.department) filter.department = q.department;
  if (q.search) {
    filter.$text = { $search: q.search };
  }

  const [items, total] = await Promise.all([
    Recruitment.find(filter)
      .populate('department', 'name code shortName')
      .skip(((Number(q.page) || 1) - 1) * (Number(q.pageSize) || 10))
      .limit(Number(q.pageSize) || 10)
      .sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    Recruitment.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { ...pagination, total },
  });
});

// Pipeline stage counts derived from recruitment status
const PIPELINE_STAGE_MAP: Record<string, string> = {
  draft: 'new',
  open: 'screening',
  closed: 'interview',
  completed: 'offer',
  cancelled: 'cancelled',
};

export const getRecruitmentStats = asyncHandler(async (req: Request, res: Response) => {
  const [total, byStatus, byDepartment] = await Promise.all([
    Recruitment.countDocuments(),
    Recruitment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1 } },
    ]),
    Recruitment.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$dept.name', 'Chưa phân'] }, count: 1 } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const stageCounts: Record<string, number> = {
    new: 0,
    screening: 0,
    test: 0,
    interview: 0,
    offer: 0,
    cancelled: 0,
  };
  for (const s of byStatus) {
    const stage = PIPELINE_STAGE_MAP[s.status] || 'cancelled';
    stageCounts[stage] = (stageCounts[stage] || 0) + s.count;
  }

  const totalApplicants = byStatus.reduce((s, r) => s + r.count, 0);

  res.json({
    success: true,
    data: {
      total,
      totalApplicants,
      stages: [
        { id: 'new', count: stageCounts.new },
        { id: 'screening', count: stageCounts.screening },
        { id: 'test', count: stageCounts.test },
        { id: 'interview', count: stageCounts.interview },
        { id: 'offer', count: stageCounts.offer },
        { id: 'cancelled', count: stageCounts.cancelled },
      ],
      byStatus,
      byDepartment,
    },
  });
});

export const getRecruitmentById = asyncHandler(async (req: Request, res: Response) => {
  const item = await Recruitment.findById(req.params.id).populate('department', 'name code shortName');
  if (!item) return res.status(404).json({ success: false, error: { message: 'Không tìm thấy' } });
  res.json({ success: true, data: item });
});

export const createRecruitment = asyncHandler(async (req: Request, res: Response) => {
  const item = await Recruitment.create({ ...req.body, createdBy: (req as any).user._id });
  res.status(201).json({ success: true, data: item });
});

export const updateRecruitment = asyncHandler(async (req: Request, res: Response) => {
  const item = await Recruitment.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: (req as any).user._id }, { new: true }).populate('department', 'name code');
  if (!item) return res.status(404).json({ success: false, error: { message: 'Không tìm thấy' } });
  res.json({ success: true, data: item });
});

export const deleteRecruitment = asyncHandler(async (req: Request, res: Response) => {
  const item = await Recruitment.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: { message: 'Không tìm thấy' } });
  res.json({ success: true, message: 'Đã xóa' });
});
