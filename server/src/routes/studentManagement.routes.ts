import { Router } from 'express';
import { studentManagementController } from '../controllers/studentManagement.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// ─── StudentStatusHistory ───────────────────────────────────────────────────────
router.get('/student-status-history', studentManagementController.listStatusHistory);
router.post('/student-status-history', authMiddleware, studentManagementController.createStatusChange);

// ─── StudentReservation ───────────────────────────────────────────────────────
router.get('/reservations', studentManagementController.listReservations);
router.post('/reservations', authMiddleware, studentManagementController.createReservation);
router.patch('/reservations/:id/approve', authMiddleware, studentManagementController.approveReservation);
router.patch('/reservations/:id/cancel', authMiddleware, studentManagementController.cancelReservation);

// ─── StudentDropout ───────────────────────────────────────────────────────────
router.get('/dropouts', studentManagementController.listDropouts);
router.post('/dropouts', authMiddleware, studentManagementController.createDropout);
router.patch('/dropouts/:id/approve', authMiddleware, studentManagementController.approveDropout);
router.patch('/dropouts/:id/cancel', authMiddleware, studentManagementController.cancelDropout);

// ─── StudentMajorChange ───────────────────────────────────────────────────────
router.get('/major-changes', studentManagementController.listMajorChanges);
router.post('/major-changes', authMiddleware, studentManagementController.createMajorChange);
router.patch('/major-changes/:id/approve', authMiddleware, studentManagementController.approveMajorChange);
router.patch('/major-changes/:id/cancel', authMiddleware, studentManagementController.cancelMajorChange);

// ─── StudentClassChange ───────────────────────────────────────────────────────
router.get('/class-changes', studentManagementController.listClassChanges);
router.post('/class-changes', authMiddleware, studentManagementController.createClassChange);
router.patch('/class-changes/:id/approve', authMiddleware, studentManagementController.approveClassChange);
router.patch('/class-changes/:id/cancel', authMiddleware, studentManagementController.cancelClassChange);

export default router;
