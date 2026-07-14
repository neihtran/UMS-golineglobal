import { Router } from 'express';
import { examRitBiKtxQaWmsService } from '../services/modules.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { auditMiddleware } from '../middleware/audit.middleware.js';
import { validate } from '../middleware/error.middleware.js';
import { createExamSchema, updateExamSchema } from '../validators/modules.validator.js';

const router = Router();
router.use(authMiddleware);

const listExams = asyncHandler(async (req: any, res: any) => {
  const r = await examRitBiKtxQaWmsService.listExams({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    course: req.query.course,
    status: req.query.status,
    type: req.query.type,
    academicYear: req.query.academicYear,
  });
  res.json({ success: true, data: r.data, pagination: { page: r.page, pageSize: r.pageSize, total: r.total, totalPages: r.totalPages } });
});

const createExam = asyncHandler(async (req: any, res: any) => {
  const e = await examRitBiKtxQaWmsService.createExam(req.body, req.user!._id.toString());
  res.status(201).json({ success: true, data: e });
});

const updateExam = asyncHandler(async (req: any, res: any) => {
  const e = await examRitBiKtxQaWmsService.updateExam(req.params.id, req.body);
  if (!e) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy kỳ thi' } }); return; }
  res.json({ success: true, data: e });
});

const deleteExam = asyncHandler(async (req: any, res: any) => {
  const ok = await examRitBiKtxQaWmsService.deleteExam(req.params.id);
  if (!ok) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy kỳ thi' } }); return; }
  res.json({ success: true, message: 'Đã xóa kỳ thi' });
});

const listExamSubmissions = asyncHandler(async (req: any, res: any) => {
  const r = await examRitBiKtxQaWmsService.listExamSubmissions({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
    exam: req.query.exam,
    student: req.query.student,
    status: req.query.status,
  });
  res.json({ success: true, data: r.data, pagination: { page: r.page, pageSize: r.pageSize, total: r.total, totalPages: r.totalPages } });
});

const gradeExamSubmission = asyncHandler(async (req: any, res: any) => {
  const s = await examRitBiKtxQaWmsService.gradeExamSubmission(req.params.id, req.body.score || 0, req.user!._id.toString());
  if (!s) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài thi' } }); return; }
  res.json({ success: true, data: s, message: 'Đã chấm điểm' });
});

router.get('/exams', listExams);
router.post('/exams', roleMiddleware(['ADMIN', 'GIAO_VIEN']), auditMiddleware('Exam'), validate(createExamSchema), createExam);
router.patch('/exams/:id', roleMiddleware(['ADMIN', 'GIAO_VIEN']), auditMiddleware('Exam'), validate(updateExamSchema), updateExam);
router.delete('/exams/:id', roleMiddleware(['ADMIN']), auditMiddleware('Exam'), deleteExam);

router.get('/exam-submissions', listExamSubmissions);
router.post('/exam-submissions/:id/grade', roleMiddleware(['ADMIN', 'GIAO_VIEN']), auditMiddleware('ExamSubmission'), gradeExamSubmission);

export default router;