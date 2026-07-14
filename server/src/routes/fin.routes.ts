import { Router } from 'express';
import { dmsFinLmsService } from '../services/dms-fin-lms.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { auditMiddleware } from '../middleware/audit.middleware.js';
import { validate } from '../middleware/error.middleware.js';
import { createTuitionSchema, updateTuitionSchema, createExpenseSchema, createBudgetSchema } from '../validators/dms-fms-lms.validator.js';

const router = Router();
router.use(authMiddleware);

// ─── Tuition ─────────────────────────────────────────────────────────
const listTuitions = asyncHandler(async (req, res) => {
  const result = await dmsFinLmsService.listTuitions({
    page: Number(req.query.page) || 1, pageSize: Number(req.query.pageSize) || 10,
    student: req.query.student as string,
    semester: req.query.semester as string,
    academicYear: req.query.academicYear as string,
    status: req.query.status as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});
const getTuitionById = asyncHandler(async (req, res) => {
  const t = await dmsFinLmsService.getTuitionById(req.params.id);
  if (!t) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy học phí' } }); return; }
  res.json({ success: true, data: t });
});
const createTuition = asyncHandler(async (req, res) => {
  try {
    const t = await dmsFinLmsService.createTuition(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: t });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});
const updateTuition = asyncHandler(async (req, res) => {
  const t = await dmsFinLmsService.updateTuition(req.params.id, req.body);
  if (!t) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy học phí' } }); return; }
  res.json({ success: true, data: t });
});
const deleteTuition = asyncHandler(async (req, res) => {
  const ok = await dmsFinLmsService.deleteTuition(req.params.id);
  if (!ok) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy học phí' } }); return; }
  res.json({ success: true, message: 'Đã xóa học phí' });
});

// ─── Expenses ─────────────────────────────────────────────────────────
const listExpenses = asyncHandler(async (req, res) => {
  const result = await dmsFinLmsService.listExpenses({
    page: Number(req.query.page) || 1, pageSize: Number(req.query.pageSize) || 10,
    category: req.query.category as string, status: req.query.status as string,
    department: req.query.department as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});
const createExpense = asyncHandler(async (req, res) => {
  try {
    const e = await dmsFinLmsService.createExpense(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: e });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});
const approveExpense = asyncHandler(async (req, res) => {
  const e = await dmsFinLmsService.approveExpense(req.params.id, req.user!._id.toString());
  if (!e) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy chi phí' } }); return; }
  res.json({ success: true, data: e, message: 'Đã phê duyệt chi phí' });
});
const deleteExpense = asyncHandler(async (req, res) => {
  const ok = await dmsFinLmsService.deleteExpense(req.params.id);
  if (!ok) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy chi phí' } }); return; }
  res.json({ success: true, message: 'Đã xóa chi phí' });
});

// ─── Budgets ─────────────────────────────────────────────────────────
const listBudgets = asyncHandler(async (req, res) => {
  const result = await dmsFinLmsService.listBudgets({
    page: Number(req.query.page) || 1, pageSize: Number(req.query.pageSize) || 10,
    year: req.query.year as string, department: req.query.department as string,
    status: req.query.status as string,
  });
  res.json({ success: true, data: result.data, pagination: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } });
});
const getBudgetById = asyncHandler(async (req, res) => {
  const b = await dmsFinLmsService.getBudgetById(req.params.id);
  if (!b) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy ngân sách' } }); return; }
  res.json({ success: true, data: b });
});
const createBudget = asyncHandler(async (req, res) => {
  try {
    const b = await dmsFinLmsService.createBudget(req.body, req.user!._id.toString());
    res.status(201).json({ success: true, data: b });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

router.get('/tuitions', listTuitions);
router.get('/tuitions/:id', getTuitionById);
router.post('/tuitions', roleMiddleware(['ADMIN', 'NHAN_VIEN']), auditMiddleware('Tuition'), validate(createTuitionSchema), createTuition);
router.patch('/tuitions/:id', roleMiddleware(['ADMIN', 'NHAN_VIEN']), auditMiddleware('Tuition'), validate(updateTuitionSchema), updateTuition);
router.delete('/tuitions/:id', roleMiddleware(['ADMIN']), auditMiddleware('Tuition'), deleteTuition);

router.get('/expenses', listExpenses);
router.post('/expenses', roleMiddleware(['ADMIN', 'NHAN_VIEN']), auditMiddleware('Expense'), validate(createExpenseSchema), createExpense);
router.post('/expenses/:id/approve', roleMiddleware(['ADMIN']), auditMiddleware('Expense'), approveExpense);
router.delete('/expenses/:id', roleMiddleware(['ADMIN']), auditMiddleware('Expense'), deleteExpense);

router.get('/budgets', listBudgets);
router.get('/budgets/:id', getBudgetById);
router.post('/budgets', roleMiddleware(['ADMIN', 'NHAN_VIEN']), auditMiddleware('Budget'), validate(createBudgetSchema), createBudget);

export default router;