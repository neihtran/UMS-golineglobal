import { Router } from 'express';
import { dmsFinLmsService } from '../services/dms-fin-lms.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { auditMiddleware } from '../middleware/audit.middleware.js';
import { validate } from '../middleware/error.middleware.js';
import { createDocumentSchema, updateDocumentSchema, createFolderSchema } from '../validators/dms-fms-lms.validator.js';

const router = Router();
router.use(authMiddleware);

// ─── Documents ────────────────────────────────────────────────────────────
const listDocuments = asyncHandler(async (req, res) => {
  const result = await dmsFinLmsService.listDocuments({
    page: Number(req.query.page) || 1, pageSize: Number(req.query.pageSize) || 10,
    search: req.query.search as string, status: req.query.status as string,
    type: req.query.type as string, author: req.query.author as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});
const getDocumentById = asyncHandler(async (req, res) => {
  const doc = await dmsFinLmsService.getDocumentById(req.params.id);
  if (!doc) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy văn bản' } }); return; }
  res.json({ success: true, data: doc });
});
const createDocument = asyncHandler(async (req, res) => {
  try {
    const doc = await dmsFinLmsService.createDocument(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});
const updateDocument = asyncHandler(async (req, res) => {
  const doc = await dmsFinLmsService.updateDocument(req.params.id, req.body, req.user!._id.toString());
  if (!doc) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy văn bản' } }); return; }
  res.json({ success: true, data: doc });
});
const deleteDocument = asyncHandler(async (req, res) => {
  const ok = await dmsFinLmsService.deleteDocument(req.params.id);
  if (!ok) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy văn bản' } }); return; }
  res.json({ success: true, message: 'Đã xóa văn bản' });
});

// ─── Folders ──────────────────────────────────────────────────────────────
const listFolders = asyncHandler(async (req, res) => {
  const folders = await dmsFinLmsService.listFolders({ parent: req.query.parent as string });
  res.json({ success: true, data: folders });
});
const createFolder = asyncHandler(async (req, res) => {
  const folder = await dmsFinLmsService.createFolder(req.body, req.user!._id.toString());
  res.status(201).json({ success: true, data: folder });
});
const deleteFolder = asyncHandler(async (req, res) => {
  try {
    const ok = await dmsFinLmsService.deleteFolder(req.params.id);
    if (!ok) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy thư mục' } }); return; }
    res.json({ success: true, message: 'Đã xóa thư mục' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } });
  }
});

router.get('/documents', listDocuments);
router.get('/documents/:id', getDocumentById);
router.post('/documents', roleMiddleware(['ADMIN', 'NHAN_VIEN']), auditMiddleware('Document'), validate(createDocumentSchema), createDocument);
router.patch('/documents/:id', roleMiddleware(['ADMIN', 'NHAN_VIEN']), auditMiddleware('Document'), validate(updateDocumentSchema), updateDocument);
router.delete('/documents/:id', roleMiddleware(['ADMIN']), auditMiddleware('Document'), deleteDocument);

router.get('/folders', listFolders);
router.post('/folders', roleMiddleware(['ADMIN', 'NHAN_VIEN']), auditMiddleware('DocumentFolder'), validate(createFolderSchema), createFolder);
router.delete('/folders/:id', roleMiddleware(['ADMIN']), auditMiddleware('DocumentFolder'), deleteFolder);

export default router;