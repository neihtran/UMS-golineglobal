import { Request, Response } from 'express';
import { Announcement, Notification } from '@/models/index.js';
import { Types } from 'mongoose';
import { asyncHandler } from '@/middleware/asyncHandler.js';

// ─── Portal Stats ──────────────────────────────────────────────────────────────
export const getPortalStats = asyncHandler(async (_req: Request, res: Response) => {
  const [total, published, urgent, pinned, unreadNotifications] = await Promise.all([
    Announcement.countDocuments(),
    Announcement.countDocuments({ status: 'published' }),
    Announcement.countDocuments({ urgency: 'urgent' }),
    Announcement.countDocuments({ status: 'pinned' }),
    Notification.countDocuments({ isRead: false }),
  ]);

  res.json({
    success: true,
    data: {
      total,
      published,
      urgent,
      pinned,
      unreadNotifications,
    },
  });
});

// ─── Announcement CRUD ─────────────────────────────────────────────────────────
export const getAnnouncementList = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as any;
  const page = Number(q.page) || 1;
  const pageSize = Number(q.pageSize) || 20;
  const filter: Record<string, unknown> = {};

  if (q.category) filter.category = q.category;
  if (q.status) filter.status = q.status;
  if (q.author) filter.author = q.author;
  if (q.tag) filter.tags = q.tag;
  if (q.search) {
    filter.$or = [
      { title: { $regex: q.search, $options: 'i' } },
      { content: { $regex: q.search, $options: 'i' } },
    ];
  }

  const [list, total] = await Promise.all([
    Announcement.find(filter)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort(q.sortBy ? { [q.sortBy]: q.sortDir === 'asc' ? 1 : -1 } : { createdAt: -1 }),
    Announcement.countDocuments(filter),
  ]);

  res.json({ success: true, data: list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const getAnnouncementById = asyncHandler(async (req: Request, res: Response) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Thông báo không tồn tại' } }); return; }
  // Increment view count
  await Announcement.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
  res.json({ success: true, data: announcement });
});

export const createAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as any;
  if (body.publishAt) body.publishAt = new Date(body.publishAt);
  if (body.expiresAt) body.expiresAt = new Date(body.expiresAt);
  if (body.pinnedAt) body.pinnedAt = new Date(body.pinnedAt);
  const announcement = await Announcement.create({ ...body, author: req.user?._id });
  res.status(201).json({ success: true, data: announcement });
});

export const updateAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const updates = req.body;
  if (updates.publishAt) updates.publishAt = new Date(updates.publishAt);
  if (updates.expiresAt) updates.expiresAt = new Date(updates.expiresAt);
  if (updates.pinnedAt) updates.pinnedAt = new Date(updates.pinnedAt);
  const announcement = await Announcement.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
  if (!announcement) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Thông báo không tồn tại' } }); return; }
  res.json({ success: true, data: announcement });
});

export const deleteAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const announcement = await Announcement.findByIdAndUpdate(req.params.id, { $set: { status: 'archived' } }, { new: true });
  if (!announcement) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Thông báo không tồn tại' } }); return; }
  res.json({ success: true, message: 'Đã lưu trữ thông báo' });
});

// ─── Notifications ─────────────────────────────────────────────────────────────
export const getNotificationList = asyncHandler(async (req: Request, res: Response) => {
  const recipientId = req.user?._id.toString();
  if (!recipientId) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } }); return; }

  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;
  const filter: Record<string, unknown> = { recipientId };

  const [notifications, total] = await Promise.all([
    Notification.find(filter).skip((page - 1) * pageSize).limit(pageSize).sort({ createdAt: -1 }),
    Notification.countDocuments(filter),
  ]);

  res.json({ success: true, data: notifications, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, { $set: { isRead: true, readAt: new Date() } }, { new: true });
  if (!notification) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Thông báo không tồn tại' } }); return; }
  res.json({ success: true, data: notification });
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  const recipientId = req.user?._id.toString();
  await Notification.updateMany({ recipientId, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
  res.json({ success: true, message: 'Đã đánh dấu tất cả đã đọc' });
});
