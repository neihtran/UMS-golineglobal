import { Router } from 'express';
import { examRitBiKtxQaWmsService } from '../services/modules.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { auditMiddleware } from '../middleware/audit.middleware.js';
import { validate } from '../middleware/error.middleware.js';
import { createResearchSchema, updateResearchSchema, createKpiSchema, updateKpiSchema } from '../validators/modules.validator.js';

const router = Router();
router.use(authMiddleware);

const svc = examRitBiKtxQaWmsService;

// ─── Research Projects (RIT) ──────────────────────────────────────
const listResearch = asyncHandler(async (req: any, res: any) => {
  const r = await svc.listResearch({ page: Number(req.query.page)||1, pageSize: Number(req.query.pageSize)||10, status: req.query.status, leader: req.query.leader });
  res.json({ success: true, data: r.data, pagination: { page: r.page, pageSize: r.pageSize, total: r.total, totalPages: r.totalPages } });
});
const createResearch = asyncHandler(async (req: any, res: any) => {
  const rp = await svc.createResearch(req.body, req.user!._id.toString());
  res.status(201).json({ success: true, data: rp });
});
const updateResearch = asyncHandler(async (req: any, res: any) => {
  const rp = await svc.updateResearch(req.params.id, req.body);
  if (!rp) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đề tài' } }); return; }
  res.json({ success: true, data: rp });
});
router.get('/research', listResearch);
router.post('/research', roleMiddleware(['ADMIN', 'GIAO_VIEN']), auditMiddleware('ResearchProject'), validate(createResearchSchema), createResearch);
router.patch('/research/:id', roleMiddleware(['ADMIN', 'GIAO_VIEN']), auditMiddleware('ResearchProject'), validate(updateResearchSchema), updateResearch);

// ─── KPIs (BI) ─────────────────────────────────────────────────
const listKpis = asyncHandler(async (req: any, res: any) => {
  const r = await svc.listKpis({ page: Number(req.query.page)||1, pageSize: Number(req.query.pageSize)||20, module: req.query.module, status: req.query.status, year: req.query.year });
  res.json({ success: true, data: r.data, pagination: { page: r.page, pageSize: r.pageSize, total: r.total, totalPages: r.totalPages } });
});
const createKpi = asyncHandler(async (req: any, res: any) => {
  const k = await svc.createKpi(req.body);
  res.status(201).json({ success: true, data: k });
});
const updateKpi = asyncHandler(async (req: any, res: any) => {
  const k = await svc.updateKpi(req.params.id, req.body);
  if (!k) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy KPI' } }); return; }
  res.json({ success: true, data: k });
});
router.get('/kpis', listKpis);
router.post('/kpis', roleMiddleware(['ADMIN', 'NHAN_VIEN']), auditMiddleware('KPI'), validate(createKpiSchema), createKpi);
router.patch('/kpis/:id', roleMiddleware(['ADMIN', 'NHAN_VIEN']), auditMiddleware('KPI'), validate(updateKpiSchema), updateKpi);

export default router;