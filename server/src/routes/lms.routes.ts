import { Router } from 'express';
import { dmsFinLmsService } from '../services/dms-fin-lms.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { auditMiddleware } from '../middleware/audit.middleware.js';
import { validate } from '../middleware/error.middleware.js';
import { createAssignmentSchema, updateAssignmentSchema, createSubmissionSchema, gradeSubmissionSchema } from '../validators/dms-fms-lms.validator.js';

const router = Router();
router.use(authMiddleware);

// ─── Assignments ───────────────────────────────────────────────────────
const listAssignments = asyncHandler(async (req, res) => {
  const result = await dmsFinLmsService.listAssignments({
    page: Number(req.query.page) || 1, pageSize: Number(req.query.pageSize) || 10,
    course: req.query.course as string, status: req.query.status as string,
    type: req.query.type as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});
const getAssignmentById = asyncHandler(async (req, res) => {
  const a = await dmsFinLmsService.getAssignmentById(req.params.id);
  if (!a) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài tập' } }); return; }
  res.json({ success: true, data: a });
});
const createAssignment = asyncHandler(async (req, res) => {
  try {
    const a = await dmsFinLmsService.createAssignment(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: a });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});
const updateAssignment = asyncHandler(async (req, res) => {
  const a = await dmsFinLmsService.updateAssignment(req.params.id, req.body);
  if (!a) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài tập' } }); return; }
  res.json({ success: true, data: a });
});
const deleteAssignment = asyncHandler(async (req, res) => {
  const ok = await dmsFinLmsService.deleteAssignment(req.params.id);
  if (!ok) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài tập' } }); return; }
  res.json({ success: true, message: 'Đã xóa bài tập' });
});

// ─── Submissions ────────────────────────────────────────────────────────
const listSubmissions = asyncHandler(async (req, res) => {
  const result = await dmsFinLmsService.listSubmissions({
    page: Number(req.query.page) || 1, pageSize: Number(req.query.pageSize) || 10,
    assignment: req.query.assignment as string,
    student: req.query.student as string,
    status: req.query.status as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});
const createSubmission = asyncHandler(async (req, res) => {
  try {
    const s = await dmsFinLmsService.createSubmission(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: s });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'SUBMISSION_ERROR', message: error.message } });
  }
});
const gradeSubmission = asyncHandler(async (req, res) => {
  const s = await dmsFinLmsService.gradeSubmission(req.params.id, req.body, req.user!._id.toString());
  if (!s) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài nộp' } }); return; }
  res.json({ success: true, data: s, message: 'Đã chấm điểm' });
});

router.get('/assignments', listAssignments);
router.get('/assignments/:id', getAssignmentById);
router.post('/assignments', roleMiddleware(['ADMIN', 'GIAO_VIEN']), auditMiddleware('Assignment'), validate(createAssignmentSchema), createAssignment);
router.patch('/assignments/:id', roleMiddleware(['ADMIN', 'GIAO_VIEN']), auditMiddleware('Assignment'), validate(updateAssignmentSchema), updateAssignment);
router.delete('/assignments/:id', roleMiddleware(['ADMIN', 'GIAO_VIEN']), auditMiddleware('Assignment'), deleteAssignment);

router.get('/submissions', listSubmissions);
router.post('/submissions', auditMiddleware('Submission'), validate(createSubmissionSchema), createSubmission);
router.post('/submissions/:id/grade', roleMiddleware(['ADMIN', 'GIAO_VIEN']), auditMiddleware('Submission'), validate(gradeSubmissionSchema), gradeSubmission);

export default router;