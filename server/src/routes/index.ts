import { Router } from 'express';
import authRoutes from './auth.routes.js';
import hrmRoutes from './hrm.routes.js';
import iamRoutes from './iam.routes.js';
import sisRoutes from './sis.routes.js';
import dmsRoutes from './dms.routes.js';
import finRoutes from './fin.routes.js';
import lmsRoutes from './lms.routes.js';
import examRoutes from './exam.routes.js';
import ritBiRoutes from './rit-bi.routes.js';
import ktxQaWmsRoutes from './ktx-qa-wms.routes.js';
import stubsRoutes from './stubs.routes.js';
import biIntRoutes from './bi-int.routes.js';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// ─── Auth Routes ──────────────────────────────────────────────────────────────
// Public auth routes
router.use('/auth', authRoutes);

// Protected auth routes (need authentication)
router.get('/auth/me', authMiddleware, authController.getCurrentUser);
router.post('/auth/logout', authMiddleware, authController.logout);
router.post('/auth/mfa/setup', authMiddleware, authController.setupMfa);
router.post('/auth/mfa/enable', authMiddleware, authController.enableMfa);

// ─── Module Routes ────────────────────────────────────────────────────────────
router.use('/hrm', hrmRoutes);
router.use('/iam', iamRoutes);
router.use('/sis', sisRoutes);
router.use('/dms', dmsRoutes);
router.use('/fin', finRoutes);
router.use('/lms', lmsRoutes);
router.use('/exam', examRoutes);
router.use('/rit', ritBiRoutes);
router.use('/bi', ritBiRoutes);
router.use('/ktx', ktxQaWmsRoutes);
router.use('/qa', ktxQaWmsRoutes);
router.use('/wms', ktxQaWmsRoutes);
router.use(stubsRoutes);

// ─── BI & Integration Routes (Phase 7) ─────────────────────────────────────────
router.get('/bi/overview', biIntRoutes.getOverview);
router.get('/bi/departments', biIntRoutes.getDepartmentAnalytics);
router.get('/bi/enrollments', biIntRoutes.getEnrollmentStats);
router.get('/bi/tuition', biIntRoutes.getTuitionAnalytics);
router.get('/bi/demographics', biIntRoutes.getStudentDemographics);
router.get('/bi/positions', biIntRoutes.getStaffPositions);
router.get('/bi/courses', biIntRoutes.getCoursePerformance);
router.get('/bi/audit', biIntRoutes.getAuditSummary);
router.get('/bi/trends', biIntRoutes.getTrends);
router.get('/bi/revenue', biIntRoutes.getRevenueReport);
router.get('/bi/executive-report', biIntRoutes.getExecutiveReport);

// Integration routes
router.get('/int/status', biIntRoutes.getStatus);
router.post('/int/hemis/enrollments', biIntRoutes.syncHEMISEnrollment);
router.post('/int/hemis/tuitions', biIntRoutes.syncHEMISTuition);
router.post('/int/vneid/verify', biIntRoutes.verifyVNeID);
router.post('/int/vgca/issue-degree', biIntRoutes.issueVGCADegree);
router.get('/int/vgca/verify/:serialNumber', biIntRoutes.verifyVGCADegree);
router.post('/int/csdl/register-degree', biIntRoutes.registerCSDLDegree);
router.post('/int/khobac/payments', biIntRoutes.createKhoBacPayment);
router.get('/int/khobac/reconcile', biIntRoutes.reconcileKhoBac);

// ─── Health Check ─────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'UMS API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
