import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import departmentRoutes from './department.routes.js';
import hrmRoutes from './hrm.routes.js';
import leaveRoutes from './leave.routes.js';
import recruitmentRoutes from './recruitment.routes.js';
import auditRoutes from './audit.routes.js';
import disciplineRoutes from './discipline.routes.js';
import salarySheetRoutes from './salary-sheet.routes.js';
import appointmentRoutes from './appointment.routes.js';
import staffDetailRoutes from './staff-detail.routes.js';

// GD2: Core Business
import sisRoutes from './sis.routes.js';
import sisSubjectsRoutes from './sis.subjects.js';
import sisEnrollmentsRoutes from './sis.enrollments.js';
import sisCurriculumRoutes from './sis.curriculum.js';
import sisInternshipsRoutes from './sis.internships.js';
import sisGraduationRoutes from './sis.graduation.js';

import dmsRoutes from './dms.routes.js';
import wmsRoutes from './wms.routes.js';
import ocrRoutes from './ocr.routes.js';

// GD3: Teaching
import lmsRoutes from './lms.routes.js';
import examRoutes from './exam.routes.js';
import portalRoutes from './portal.routes.js';

// GD4: Operations
import finRoutes from './fin.routes.js';
import ktxRoutes from './ktx.routes.js';
import ritRoutes from './rit.routes.js';
import intRoutes from './int.routes.js';
import biRoutes from './bi.routes.js';
import qaRoutes from './qa.routes.js';
import dceRoutes from './dce.routes.js';
import libRoutes from './lib.routes.js';
import pmsRoutes from './pms.routes.js';

const router = Router();

// GD1: Nền tảng (already registered)
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/departments', departmentRoutes);
router.use('/hrm', hrmRoutes);
router.use('/hrm/vien-chuc', staffDetailRoutes);
router.use('/leave', leaveRoutes);
router.use('/recruitment', recruitmentRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/discipline', disciplineRoutes);
router.use('/salary-sheets', salarySheetRoutes);
router.use('/appointments', appointmentRoutes);

// GD2: Core Business
router.use('/sis', sisRoutes);
router.use('/sis/subjects', sisSubjectsRoutes);
router.use('/sis/enrollments', sisEnrollmentsRoutes);
router.use('/sis/curriculum', sisCurriculumRoutes);
router.use('/sis/internships', sisInternshipsRoutes);
router.use('/sis/graduation', sisGraduationRoutes);

router.use('/dms', dmsRoutes);
router.use('/wms', wmsRoutes);
router.use('/ocr', ocrRoutes);

// GD3: Teaching
router.use('/lms', lmsRoutes);
router.use('/exam', examRoutes);
router.use('/portal', portalRoutes);

// GD4: Operations
router.use('/fin', finRoutes);
router.use('/ktx', ktxRoutes);
router.use('/rit', ritRoutes);
router.use('/int', intRoutes);
router.use('/bi', biRoutes);
router.use('/qa', qaRoutes);
router.use('/dce', dceRoutes);
router.use('/lib', libRoutes);
router.use('/pms', pmsRoutes);

export default router;
