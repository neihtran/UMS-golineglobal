import { Request, Response } from 'express';
import { Document, DocumentCategory, ApprovalFlow } from '@/models/index.js';
import { Types } from 'mongoose';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { asyncHandler as ah } from '@/middleware/asyncHandler.js';

// ─── Document stats ────────────────────────────────────────────────────────────
export const getDmsStats = ah(async (_req: Request, res: Response) => {
  const [
    total, draft, pending, approved, published, rejected, archived,
    external, urgent,
  ] = await Promise.all([
    Document.countDocuments(),
    Document.countDocuments({ status: 'draft' }),
    Document.countDocuments({ status: 'pending_review' }),
    Document.countDocuments({ status: 'approved' }),
    Document.countDocuments({ status: 'published' }),
    Document.countDocuments({ status: 'rejected' }),
    Document.countDocuments({ status: 'archived' }),
    Document.countDocuments({ isExternal: true }),
    Document.countDocuments({ urgency: { $in: ['urgent', 'very_urgent', 'immediate'] } }),
  ]);

  res.json({
    success: true,
    data: {
      total,
      byStatus: { draft, pending, approved, published, rejected, archived },
      external,
      urgentCount: urgent,
    },
  });
});

// ─── Document CRUD ─────────────────────────────────────────────────────────────
export const getDocumentList = ah(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 15;
  const filter: Record<string, unknown> = {};

  if (q.status) filter.status = q.status;
  if (q.categoryId) filter.categoryId = new Types.ObjectId(q.categoryId);
  if (q.department) filter.department = q.department;
  if (q.urgency) filter.urgency = q.urgency;
  if (q.security) filter.security = q.security;
  if (q.isExternal !== undefined) filter.isExternal = q.isExternal;
  if (q.issuer) filter.issuer = { $regex: q.issuer, $options: 'i' };
  if (q.signer) filter.signer = { $regex: q.signer, $options: 'i' };
  if (q.fromDate || q.toDate) {
    filter.createdAt = {};
    if (q.fromDate) (filter.createdAt as any).$gte = new Date(q.fromDate);
    if (q.toDate) (filter.createdAt as any).$lte = new Date(q.toDate);
  }
  if (q.search) {
    filter.$or = [
      { title: { $regex: q.search, $options: 'i' } },
      { documentNumber: { $regex: q.search, $options: 'i' } },
    ];
  }

  const [docs, total] = await Promise.all([
    Document.find(filter)
      .populate('categoryId', 'name code')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    Document.countDocuments(filter),
  ]);

  res.json({ success: true, data: docs, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const getDocumentById = ah(async (req: Request, res: Response) => {
  const doc = await Document.findById(req.params.id).populate('categoryId', 'name code');
  if (!doc) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Văn bản không tồn tại' } }); return; }
  res.json({ success: true, data: doc });
});

export const createDocument = ah(async (req: Request, res: Response) => {
  const body = req.body as any;
  const data: Record<string, unknown> = { ...body, createdBy: req.user?._id };
  if (body.categoryId) data.categoryId = new Types.ObjectId(body.categoryId);
  if (body.parentId) data.parentId = new Types.ObjectId(body.parentId);
  if (body.dueDate) data.dueDate = new Date(body.dueDate);

  const doc = await Document.create(data);
  const saved = await Document.findById(doc._id).populate('categoryId', 'name code');
  res.status(201).json({ success: true, data: saved });
});

export const updateDocument = ah(async (req: Request, res: Response) => {
  const body = req.body as any;
  const updates: Record<string, unknown> = { ...body, updatedBy: req.user?._id };
  if (updates.categoryId) updates.categoryId = new Types.ObjectId(updates.categoryId as string);
  if (updates.parentId) updates.parentId = new Types.ObjectId(updates.parentId as string);
  if (updates.dueDate) updates.dueDate = new Date(updates.dueDate as string);

  const doc = await Document.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true }).populate('categoryId', 'name code');
  if (!doc) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Văn bản không tồn tại' } }); return; }
  res.json({ success: true, data: doc });
});

export const deleteDocument = ah(async (req: Request, res: Response) => {
  const doc = await Document.findByIdAndUpdate(req.params.id, { $set: { status: 'archived' } }, { new: true });
  if (!doc) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Văn bản không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã lưu trữ văn bản' });
});

export const publishDocument = ah(async (req: Request, res: Response) => {
  const doc = await Document.findByIdAndUpdate(req.params.id, { $set: { status: 'published', publishedAt: new Date() } }, { new: true }).populate('categoryId', 'name code');
  if (!doc) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Văn bản không tồn tại' } }); return; }
  res.json({ success: true, data: doc });
});

// ─── Categories ────────────────────────────────────────────────────────────────
export const getCategories = ah(async (_req: Request, res: Response) => {
  const cats = await DocumentCategory.find({ isActive: true }).sort({ name: 1 });
  res.json({ success: true, data: cats });
});

export const getCategoryById = ah(async (req: Request, res: Response) => {
  const cat = await DocumentCategory.findById(req.params.id);
  if (!cat) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Danh mục không tồn tại' } }); return; }
  res.json({ success: true, data: cat });
});

export const createCategory = ah(async (req: Request, res: Response) => {
  const cat = await DocumentCategory.create(req.body);
  res.status(201).json({ success: true, data: cat });
});
