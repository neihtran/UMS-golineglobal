import { Router } from 'express';
import { scheduleController } from '../controllers/schedule.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// ─── ClassSchedule ──────────────────────────────────────────────────────────
router.get('/schedules', scheduleController.listSchedules);
router.get('/schedules/:id', scheduleController.getScheduleById);
router.get('/schedules/course/:courseId', scheduleController.getSchedulesByCourse);
router.post('/schedules', authMiddleware, scheduleController.createSchedule);
router.patch('/schedules/:id', authMiddleware, scheduleController.updateSchedule);
router.delete('/schedules/:id', authMiddleware, scheduleController.deleteSchedule);

// ─── ScheduleChange ─────────────────────────────────────────────────────────
router.get('/schedule-changes', scheduleController.listScheduleChanges);
router.post('/schedule-changes', authMiddleware, scheduleController.createScheduleChange);
router.patch('/schedule-changes/:id/approve', authMiddleware, scheduleController.approveScheduleChange);
router.patch('/schedule-changes/:id/reject', authMiddleware, scheduleController.rejectScheduleChange);

// ─── GPAHistory ─────────────────────────────────────────────────────────────
router.get('/students/:studentId/gpa-history', scheduleController.getGPAHistory);
router.post('/gpa/calculate/:studentId/:academicTermId', authMiddleware, scheduleController.calculateGPA);

// ─── AcademicWarning ──────────────────────────────────────────────────────────
router.get('/warnings', scheduleController.listWarnings);
router.post('/warnings', authMiddleware, scheduleController.createWarning);
router.patch('/warnings/:id/resolve', authMiddleware, scheduleController.resolveWarning);

// ─── StudentLog ──────────────────────────────────────────────────────────────
router.get('/students/:studentId/logs', scheduleController.getStudentLogs);

export default router;
