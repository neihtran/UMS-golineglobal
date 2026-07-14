import { Router } from 'express';
import { examRitBiKtxQaWmsService } from '../services/modules.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { auditMiddleware } from '../middleware/audit.middleware.js';
import { validate } from '../middleware/error.middleware.js';
import { createKtxRoomSchema, updateKtxRoomSchema, createQaEvidenceSchema, updateQaEvidenceSchema, createWmsTaskSchema, updateWmsTaskSchema } from '../validators/modules.validator.js';

const router = Router();
router.use(authMiddleware);

const svc = examRitBiKtxQaWmsService;

// ─── KTX Rooms ────────────────────────────────────────────────
const listKtxRooms = asyncHandler(async (req: any, res: any) => {
  const r = await svc.listKtxRooms({ page: Number(req.query.page)||1, pageSize: Number(req.query.pageSize)||20, building: req.query.building, status: req.query.status, type: req.query.type });
  res.json({ success: true, data: r.data, pagination: { page: r.page, pageSize: r.pageSize, total: r.total, totalPages: r.totalPages } });
});
const createKtxRoom = asyncHandler(async (req: any, res: any) => {
  const room = await svc.createKtxRoom(req.body);
  res.status(201).json({ success: true, data: room });
});
const updateKtxRoom = asyncHandler(async (req: any, res: any) => {
  const room = await svc.updateKtxRoom(req.params.id, req.body);
  if (!room) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy phòng' } }); return; }
  res.json({ success: true, data: room });
});
router.get('/rooms', listKtxRooms);
router.post('/rooms', roleMiddleware(['ADMIN', 'NHAN_VIEN']), auditMiddleware('KtxRoom'), validate(createKtxRoomSchema), createKtxRoom);
router.patch('/rooms/:id', roleMiddleware(['ADMIN', 'NHAN_VIEN']), auditMiddleware('KtxRoom'), validate(updateKtxRoomSchema), updateKtxRoom);

// ─── QA Evidence ──────────────────────────────────────────────
const listQaEvidence = asyncHandler(async (req: any, res: any) => {
  const r = await svc.listQaEvidence({ page: Number(req.query.page)||1, pageSize: Number(req.query.pageSize)||20, standard: req.query.standard, status: req.query.status });
  res.json({ success: true, data: r.data, pagination: { page: r.page, pageSize: r.pageSize, total: r.total, totalPages: r.totalPages } });
});
const createQaEvidence = asyncHandler(async (req: any, res: any) => {
  const ev = await svc.createQaEvidence(req.body, req.user!._id.toString());
  res.status(201).json({ success: true, data: ev });
});
const updateQaEvidence = asyncHandler(async (req: any, res: any) => {
  const ev = await svc.updateQaEvidence(req.params.id, req.body);
  if (!ev) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bằng chứng' } }); return; }
  res.json({ success: true, data: ev });
});
router.get('/evidence', listQaEvidence);
router.post('/evidence', roleMiddleware(['ADMIN', 'GIAO_VIEN', 'NHAN_VIEN']), auditMiddleware('QaEvidence'), validate(createQaEvidenceSchema), createQaEvidence);
router.patch('/evidence/:id', roleMiddleware(['ADMIN', 'GIAO_VIEN', 'NHAN_VIEN']), auditMiddleware('QaEvidence'), validate(updateQaEvidenceSchema), updateQaEvidence);

// ─── WMS Tasks ────────────────────────────────────────────────
const listWmsTasks = asyncHandler(async (req: any, res: any) => {
  const r = await svc.listWmsTasks({ page: Number(req.query.page)||1, pageSize: Number(req.query.pageSize)||20, assignee: req.query.assignee, status: req.query.status, priority: req.query.priority });
  res.json({ success: true, data: r.data, pagination: { page: r.page, pageSize: r.pageSize, total: r.total, totalPages: r.totalPages } });
});
const createWmsTask = asyncHandler(async (req: any, res: any) => {
  const task = await svc.createWmsTask(req.body, req.user!._id.toString());
  res.status(201).json({ success: true, data: task });
});
const updateWmsTask = asyncHandler(async (req: any, res: any) => {
  const task = await svc.updateWmsTask(req.params.id, req.body);
  if (!task) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy công việc' } }); return; }
  res.json({ success: true, data: task });
});
router.get('/tasks', listWmsTasks);
router.post('/tasks', roleMiddleware(['ADMIN', 'GIAO_VIEN', 'NHAN_VIEN']), auditMiddleware('WmsTask'), validate(createWmsTaskSchema), createWmsTask);
router.patch('/tasks/:id', roleMiddleware(['ADMIN', 'GIAO_VIEN', 'NHAN_VIEN']), auditMiddleware('WmsTask'), validate(updateWmsTaskSchema), updateWmsTask);

export default router;