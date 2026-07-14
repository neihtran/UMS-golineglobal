import { Router } from 'express';
import { hrmController } from '../controllers/hrm.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { auditMiddleware } from '../middleware/audit.middleware.js';
import { validate } from '../middleware/error.middleware.js';
import { createVienChucSchema, updateVienChucSchema, createDepartmentSchema, createLeaveRequestSchema, createContractSchema, updateContractSchema, createSalarySheetSchema } from '../validators/hrm.validator.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ─── VienChuc Routes ─────────────────────────────────────────────────────────

// List all VienChuc with pagination & filters
router.get('/vien-chuc', hrmController.getVienChucList);

// Get VienChuc stats
router.get('/vien-chuc-stats', hrmController.getVienChucStats);

// Get single VienChuc by ID
router.get('/vien-chuc/:id', hrmController.getVienChucById);

// Create VienChuc (Admin, NhanVien)
router.post(
  '/vien-chuc',
  roleMiddleware(['ADMIN', 'NHAN_VIEN', 'CHUYEN_VIEN']),
  auditMiddleware('VienChuc'),
  validate(createVienChucSchema),
  hrmController.createVienChuc
);

// Update VienChuc
router.patch(
  '/vien-chuc/:id',
  roleMiddleware(['ADMIN', 'NHAN_VIEN', 'CHUYEN_VIEN']),
  auditMiddleware('VienChuc'),
  validate(updateVienChucSchema),
  hrmController.updateVienChuc
);

// Delete VienChuc (Admin only)
router.delete(
  '/vien-chuc/:id',
  roleMiddleware(['ADMIN']),
  auditMiddleware('VienChuc'),
  hrmController.deleteVienChuc
);

// ─── Department Routes ─────────────────────────────────────────────────────────

// List all departments
router.get('/departments', hrmController.getDepartmentList);

// Get single department by ID
router.get('/departments/:id', hrmController.getDepartmentById);

// Create department
router.post(
  '/departments',
  roleMiddleware(['ADMIN']),
  auditMiddleware('Department'),
  validate(createDepartmentSchema),
  hrmController.createDepartment
);

// Update department
router.patch(
  '/departments/:id',
  roleMiddleware(['ADMIN']),
  auditMiddleware('Department'),
  hrmController.updateDepartment
);

// Delete department
router.delete(
  '/departments/:id',
  roleMiddleware(['ADMIN']),
  auditMiddleware('Department'),
  hrmController.deleteDepartment
);

// ─── Leave Request Routes ─────────────────────────────────────────────────────

// List leave requests
router.get('/leave-requests', hrmController.getLeaveRequestList);

// Create leave request
router.post(
  '/leave-requests',
  auditMiddleware('LeaveRequest'),
  validate(createLeaveRequestSchema),
  hrmController.createLeaveRequest
);

// ─── Contract Routes ────────────────────────────────────────────────────────

router.get('/contracts', hrmController.listContracts);
router.get('/contracts/:id', hrmController.getContractById);

router.post(
  '/contracts',
  roleMiddleware(['ADMIN', 'NHAN_VIEN', 'CHUYEN_VIEN']),
  auditMiddleware('Contract'),
  validate(createContractSchema),
  hrmController.createContract,
);

router.patch(
  '/contracts/:id',
  roleMiddleware(['ADMIN', 'NHAN_VIEN', 'CHUYEN_VIEN']),
  auditMiddleware('Contract'),
  validate(updateContractSchema),
  hrmController.updateContract,
);

router.delete(
  '/contracts/:id',
  roleMiddleware(['ADMIN']),
  auditMiddleware('Contract'),
  hrmController.deleteContract,
);

// ─── Salary Sheet Routes ────────────────────────────────────────────────────

router.get('/salary-sheets', hrmController.listSalarySheets);
router.get('/salary-sheets/:id', hrmController.getSalarySheetById);

router.post(
  '/salary-sheets',
  roleMiddleware(['ADMIN', 'NHAN_VIEN']),
  auditMiddleware('SalarySheet'),
  validate(createSalarySheetSchema),
  hrmController.createSalarySheet,
);

router.post(
  '/salary-sheets/:id/approve',
  roleMiddleware(['ADMIN']),
  auditMiddleware('SalarySheet'),
  hrmController.approveSalarySheet,
);

export default router;
