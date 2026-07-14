import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  LibBook, LibLoan, PmsMeeting, DceCompetency,
  PortalAnnouncement, OcrJob, IntegrationLog,
} from '../models/index.js';

const router = Router();
router.use(authMiddleware);

// ─── Shared helpers ───────────────────────────────────────────────
async function listWithPagination(model: any, req: any, res: any) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
  const skip = (page - 1) * pageSize;
  const filter: Record<string, unknown> = {};
  // Text search
  if (req.query.search) {
    const search = req.query.search as string;
    if (model.modelName === 'LibBook') {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
        { authors: { $regex: search, $options: 'i' } },
      ];
    } else if (model.modelName === 'PortalAnnouncement') {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    } else {
      filter.title = { $regex: search, $options: 'i' };
    }
  }
  // Status filter
  if (req.query.status) filter.status = req.query.status;
  // Public filter for portal
  if (model.modelName === 'PortalAnnouncement' && req.query.isPublic === 'true') {
    filter.isPublic = true;
  }
  const [data, total] = await Promise.all([
    model.find(filter).skip(skip).limit(pageSize).lean(),
    model.countDocuments(filter),
  ]);
  res.json({
    success: true, data,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

async function getById(model: any, req: any, res: any) {
  const doc = await model.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy' } });
  res.json({ success: true, data: doc });
}

async function create(model: any, req: any, res: any) {
  const doc = await model.create(req.body);
  res.status(201).json({ success: true, data: doc.toObject() });
}

async function update(model: any, req: any, res: any) {
  const doc = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).lean();
  if (!doc) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy' } });
  res.json({ success: true, data: doc });
}

async function remove(model: any, req: any, res: any) {
  const doc = await model.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy' } });
  res.json({ success: true, message: 'Xóa thành công' });
}

// ─── Library Books ───────────────────────────────────────────────
router.get('/lib/books', (req, res) => listWithPagination(LibBook, req, res));
router.get('/lib/books/:id', (req, res) => getById(LibBook, req, res));
router.post('/lib/books', (req, res) => create(LibBook, req, res));
router.patch('/lib/books/:id', (req, res) => update(LibBook, req, res));
router.delete('/lib/books/:id', (req, res) => remove(LibBook, req, res));

// ─── Library Loans ──────────────────────────────────────────────
router.get('/lib/loans', (req, res) => listWithPagination(LibLoan, req, res));
router.post('/lib/loans', (req, res) => create(LibLoan, req, res));
router.post('/lib/loans/:id/return', asyncHandler(async (req, res) => {
  const doc = await LibLoan.findByIdAndUpdate(
    req.params.id,
    { status: 'returned', returnDate: new Date() },
    { new: true }
  ).lean();
  if (!doc) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy' } }); return; }
  res.json({ success: true, data: doc, message: 'Trả sách thành công' });
}));

// ─── PMS Meetings ───────────────────────────────────────────────
router.get('/pms/meetings', (req, res) => listWithPagination(PmsMeeting, req, res));
router.get('/pms/meetings/:id', (req, res) => getById(PmsMeeting, req, res));
router.post('/pms/meetings', (req, res) => create(PmsMeeting, req, res));
router.patch('/pms/meetings/:id', (req, res) => update(PmsMeeting, req, res));
router.delete('/pms/meetings/:id', (req, res) => remove(PmsMeeting, req, res));

// ─── DCE Competencies ───────────────────────────────────────────
router.get('/dce/competencies', (req, res) => listWithPagination(DceCompetency, req, res));
router.get('/dce/competencies/:id', (req, res) => getById(DceCompetency, req, res));
router.post('/dce/competencies', (req, res) => create(DceCompetency, req, res));
router.patch('/dce/competencies/:id', (req, res) => update(DceCompetency, req, res));
router.delete('/dce/competencies/:id', (req, res) => remove(DceCompetency, req, res));

// ─── Portal Announcements ────────────────────────────────────────
router.get('/portal/announcements', (req, res) => listWithPagination(PortalAnnouncement, req, res));
router.get('/portal/announcements/:id', (req, res) => getById(PortalAnnouncement, req, res));
router.post('/portal/announcements', (req, res) => create(PortalAnnouncement, req, res));
router.patch('/portal/announcements/:id', (req, res) => update(PortalAnnouncement, req, res));
router.delete('/portal/announcements/:id', (req, res) => remove(PortalAnnouncement, req, res));

// ─── OCR Jobs ──────────────────────────────────────────────────
router.get('/ocr/jobs', (req, res) => listWithPagination(OcrJob, req, res));
router.get('/ocr/jobs/:id', (req, res) => getById(OcrJob, req, res));
router.post('/ocr/jobs', (req, res) => create(OcrJob, req, res));

// ─── Integration Logs ───────────────────────────────────────────
router.get('/int/integration-logs', asyncHandler(async (req: any, res: any) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
  const skip = (page - 1) * pageSize;
  const filter: Record<string, unknown> = {};
  if (req.query.source) filter.source = req.query.source;
  if (req.query.status) filter.status = req.query.status;
  const [data, total] = await Promise.all([
    IntegrationLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(pageSize).lean(),
    IntegrationLog.countDocuments(filter),
  ]);
  res.json({
    success: true, data,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}));
router.post('/int/integration-logs', asyncHandler(async (req: any, res: any) => {
  const doc = await IntegrationLog.create(req.body);
  res.status(201).json({ success: true, data: doc.toObject() });
}));

export default router;
