import { Request, Response } from 'express';
import { Task, Project } from '@/models/index.js';
import { Types } from 'mongoose';
import { asyncHandler } from '@/middleware/asyncHandler.js';

// ─── WMS Stats ─────────────────────────────────────────────────────────────────
export const getWmsStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    total, todo, inProgress, review, done, cancelled,
    totalProjects, activeProjects,
    overdue,
  ] = await Promise.all([
    Task.countDocuments(),
    Task.countDocuments({ status: 'todo' }),
    Task.countDocuments({ status: 'in_progress' }),
    Task.countDocuments({ status: 'review' }),
    Task.countDocuments({ status: 'done' }),
    Task.countDocuments({ status: 'cancelled' }),
    Project.countDocuments(),
    Project.countDocuments({ status: 'active' }),
    Task.countDocuments({ status: { $ne: 'done' }, dueDate: { $lt: new Date() } }),
  ]);

  res.json({
    success: true,
    data: {
      total,
      byStatus: { todo, inProgress, review, done, cancelled },
      projectCount: totalProjects,
      activeProjects,
      overdue,
    },
  });
});

// ─── Task CRUD ─────────────────────────────────────────────────────────────────
export const getTaskList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};

  if (q.projectId) filter.projectId = q.projectId;
  if (q.assignee) filter.assignee = q.assignee;
  if (q.status) filter.status = q.status;
  if (q.priority) filter.priority = q.priority;
  if (q.search) {
    filter.$or = [
      { title: { $regex: q.search, $options: 'i' } },
      { description: { $regex: q.search, $options: 'i' } },
    ];
  }
  if (q.fromDate || q.toDate) {
    filter.createdAt = {};
    if (q.fromDate) (filter.createdAt as any).$gte = new Date(q.fromDate);
    if (q.toDate) (filter.createdAt as any).$lte = new Date(q.toDate);
  }

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    Task.countDocuments(filter),
  ]);

  res.json({ success: true, data: tasks, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Công việc không tồn tại' } }); return; }
  res.json({ success: true, data: task });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;
  if (data.dueDate) data.dueDate = new Date(data.dueDate);
  if (data.startDate) data.startDate = new Date(data.startDate);
  const task = await Task.create({ ...data, createdBy: req.user?._id });
  res.status(201).json({ success: true, data: task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const updates = req.body;
  if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);
  if (updates.startDate) updates.startDate = new Date(updates.startDate);
  const task = await Task.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
  if (!task) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Công việc không tồn tại' } }); return; }
  res.json({ success: true, data: task });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findByIdAndUpdate(req.params.id, { $set: { status: 'cancelled' } }, { new: true });
  if (!task) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Công việc không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã hủy công việc' });
});

// ─── Project CRUD ──────────────────────────────────────────────────────────────
export const getProjectList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 10;
  const filter: Record<string, unknown> = {};
  if (q.status) filter.status = q.status;
  if (q.department) filter.department = q.department;

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { startDate: -1 }),
    Project.countDocuments(filter),
  ]);

  res.json({ success: true, data: projects, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Dự án không tồn tại' } }); return; }
  res.json({ success: true, data: project });
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  const project = await Project.create({ ...body, startDate: new Date(body.startDate), endDate: new Date(body.endDate) });
  res.status(201).json({ success: true, data: project });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!project) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Dự án không tồn tại' } }); return; }
  res.json({ success: true, data: project });
});
