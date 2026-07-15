import { Router } from 'express';
import { sisController } from '../controllers/sis.controller.js';
import { scheduleController } from '../controllers/schedule.controller.js';
import { studentManagementController } from '../controllers/studentManagement.controller.js';
import { admissionController } from '../controllers/admission.controller.js';
import { curriculumController } from '../controllers/curriculum.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// ─── Public (list/detail) ───────────────────────────────────────────────────
router.get('/curricula', sisController.listCurricula);
router.get('/curricula/:id', sisController.getCurriculumById);
router.get('/subjects', sisController.listSubjects);
router.get('/subjects/:id', sisController.getSubjectById);
router.get('/courses', sisController.listCourses);
router.get('/courses/:id', sisController.getCourseById);
router.get('/enrollments', sisController.listEnrollments);
router.get('/enrollments/:id', sisController.getEnrollmentById);
router.get('/students', sisController.listStudents);
router.get('/students/:id', sisController.getStudentById);
router.get('/student/stats', sisController.getStudentStats);
router.get('/graduations', sisController.listGraduations);
router.get('/graduations/:id', sisController.getGraduationById);
router.get('/graduation-sessions', sisController.listGraduationSessions);
router.get('/graduation-sessions/:id', sisController.getGraduationSessionById);
router.get('/graduation-sessions/:id/students', sisController.getGraduationSessionStudents);
router.get('/internships', sisController.listInternships);
router.get('/internships/:id', sisController.getInternshipById);

// ─── Protected (mutations require auth) ──────────────────────────────────
router.post('/curricula', authMiddleware, sisController.createCurriculum);
router.patch('/curricula/:id', authMiddleware, sisController.updateCurriculum);
router.delete('/curricula/:id', authMiddleware, sisController.deleteCurriculum);

router.post('/subjects', authMiddleware, sisController.createSubject);
router.patch('/subjects/:id', authMiddleware, sisController.updateSubject);
router.delete('/subjects/:id', authMiddleware, sisController.deleteSubject);

router.post('/courses', authMiddleware, sisController.createCourse);
router.patch('/courses/:id', authMiddleware, sisController.updateCourse);
router.delete('/courses/:id', authMiddleware, sisController.deleteCourse);

router.post('/enrollments', authMiddleware, sisController.createEnrollment);
router.patch('/enrollments/:id', authMiddleware, sisController.updateEnrollment);
router.patch('/enrollments/:id/grade', authMiddleware, sisController.gradeEnrollment);
router.delete('/enrollments/:id', authMiddleware, sisController.deleteEnrollment);

router.post('/students', authMiddleware, sisController.createStudent);
router.patch('/students/:id', authMiddleware, sisController.updateStudent);
router.delete('/students/:id', authMiddleware, sisController.deleteStudent);

router.post('/graduations', authMiddleware, sisController.createGraduation);
router.patch('/graduations/:id', authMiddleware, sisController.updateGraduation);
router.patch('/graduations/:id/issue', authMiddleware, sisController.issueDiploma);
router.delete('/graduations/:id', authMiddleware, sisController.deleteGraduation);

router.post('/graduation-sessions', authMiddleware, sisController.createGraduationSession);
router.patch('/graduation-sessions/:id', authMiddleware, sisController.updateGraduationSession);
router.delete('/graduation-sessions/:id', authMiddleware, sisController.deleteGraduationSession);

router.post('/internships', authMiddleware, sisController.createInternship);
router.patch('/internships/:id', authMiddleware, sisController.updateInternship);
router.delete('/internships/:id', authMiddleware, sisController.deleteInternship);

// ─── Training Systems ───────────────────────────────────────────────────────
router.get('/training-systems', sisController.listTrainingSystems);
router.get('/training-systems/:id', sisController.getTrainingSystemById);
router.post('/training-systems', authMiddleware, sisController.createTrainingSystem);
router.patch('/training-systems/:id', authMiddleware, sisController.updateTrainingSystem);
router.delete('/training-systems/:id', authMiddleware, sisController.deleteTrainingSystem);

// ─── Specializations ─────────────────────────────────────────────────────────
router.get('/specializations', sisController.listSpecializations);
router.get('/specializations/:id', sisController.getSpecializationById);
router.post('/specializations', authMiddleware, sisController.createSpecialization);
router.patch('/specializations/:id', authMiddleware, sisController.updateSpecialization);
router.delete('/specializations/:id', authMiddleware, sisController.deleteSpecialization);

// ─── Academic Terms ───────────────────────────────────────────────────────────
router.get('/academic-terms', sisController.listAcademicTerms);
router.get('/academic-terms/current', sisController.getCurrentAcademicTerm);
router.get('/academic-terms/:id', sisController.getAcademicTermById);
router.post('/academic-terms', authMiddleware, sisController.createAcademicTerm);
router.patch('/academic-terms/:id', authMiddleware, sisController.updateAcademicTerm);
router.delete('/academic-terms/:id', authMiddleware, sisController.deleteAcademicTerm);

// ─── Student Profiles (Phase 2) ──────────────────────────────────────────────
router.get('/students/:studentId/profile', sisController.getStudentProfile);
router.patch('/students/:studentId/profile', authMiddleware, sisController.createOrUpdateStudentProfile);

// ─── Enrollment Lock/Unlock/Cancel (Phase 2) ───────────────────────────────────
router.patch('/enrollments/:id/lock', authMiddleware, sisController.lockEnrollment);
router.patch('/enrollments/:id/unlock', authMiddleware, sisController.unlockEnrollment);
router.patch('/enrollments/:id/cancel', authMiddleware, sisController.cancelEnrollment);

// ─── ClassSchedule (Phase 3) ─────────────────────────────────────────────────
router.get('/schedules', scheduleController.listSchedules);
router.get('/schedules/:id', scheduleController.getScheduleById);
router.get('/schedules/course/:courseId', scheduleController.getSchedulesByCourse);
router.post('/schedules', authMiddleware, scheduleController.createSchedule);
router.patch('/schedules/:id', authMiddleware, scheduleController.updateSchedule);
router.delete('/schedules/:id', authMiddleware, scheduleController.deleteSchedule);

// ─── ScheduleChange (Phase 3) ────────────────────────────────────────────────
router.get('/schedule-changes', scheduleController.listScheduleChanges);
router.post('/schedule-changes', authMiddleware, scheduleController.createScheduleChange);
router.patch('/schedule-changes/:id/approve', authMiddleware, scheduleController.approveScheduleChange);
router.patch('/schedule-changes/:id/reject', authMiddleware, scheduleController.rejectScheduleChange);

// ─── GPA & AcademicWarning (Phase 3) ─────────────────────────────────────────
router.get('/students/:studentId/gpa-history', scheduleController.getGPAHistory);
router.post('/gpa/calculate/:studentId/:academicTermId', authMiddleware, scheduleController.calculateGPA);
router.get('/warnings', scheduleController.listWarnings);
router.post('/warnings', authMiddleware, scheduleController.createWarning);
router.patch('/warnings/:id/resolve', authMiddleware, scheduleController.resolveWarning);

// ─── StudentLog (Phase 3) ────────────────────────────────────────────────────
router.get('/students/:studentId/logs', scheduleController.getStudentLogs);

// ─── Student Management (Phase 4) ─────────────────────────────────────────────
router.get('/student-status-history', studentManagementController.listStatusHistory);
router.post('/student-status-history', authMiddleware, studentManagementController.createStatusChange);

router.get('/reservations', studentManagementController.listReservations);
router.post('/reservations', authMiddleware, studentManagementController.createReservation);
router.patch('/reservations/:id/approve', authMiddleware, studentManagementController.approveReservation);
router.patch('/reservations/:id/cancel', authMiddleware, studentManagementController.cancelReservation);

router.get('/dropouts', studentManagementController.listDropouts);
router.post('/dropouts', authMiddleware, studentManagementController.createDropout);
router.patch('/dropouts/:id/approve', authMiddleware, studentManagementController.approveDropout);
router.patch('/dropouts/:id/cancel', authMiddleware, studentManagementController.cancelDropout);

router.get('/major-changes', studentManagementController.listMajorChanges);
router.post('/major-changes', authMiddleware, studentManagementController.createMajorChange);
router.patch('/major-changes/:id/approve', authMiddleware, studentManagementController.approveMajorChange);
router.patch('/major-changes/:id/cancel', authMiddleware, studentManagementController.cancelMajorChange);

router.get('/class-changes', studentManagementController.listClassChanges);
router.post('/class-changes', authMiddleware, studentManagementController.createClassChange);
router.patch('/class-changes/:id/approve', authMiddleware, studentManagementController.approveClassChange);
router.patch('/class-changes/:id/cancel', authMiddleware, studentManagementController.cancelClassChange);

// ─── Admission (Phase 5) ────────────────────────────────────────────────────────
router.get('/batches', admissionController.listBatches);
router.get('/batches/:id', admissionController.getBatchById);
router.post('/batches', authMiddleware, admissionController.createBatch);
router.patch('/batches/:id', authMiddleware, admissionController.updateBatch);
router.delete('/batches/:id', authMiddleware, admissionController.deleteBatch);

router.get('/admission-students', admissionController.listStudents);
router.get('/admission-students/:id', admissionController.getStudentById);
router.post('/admission-students', authMiddleware, admissionController.createStudent);
router.patch('/admission-students/:id', authMiddleware, admissionController.updateStudent);
router.patch('/admission-students/:id/enroll', authMiddleware, admissionController.enrollStudent);
router.delete('/admission-students/:id', authMiddleware, admissionController.deleteStudent);

// ─── Curriculum (Phase 6) ────────────────────────────────────────────────────
router.get('/subject-types', curriculumController.listSubjectTypes);
router.get('/subject-types/:id', curriculumController.getSubjectTypeById);
router.post('/subject-types', authMiddleware, curriculumController.createSubjectType);
router.patch('/subject-types/:id', authMiddleware, curriculumController.updateSubjectType);
router.delete('/subject-types/:id', authMiddleware, curriculumController.deleteSubjectType);

router.get('/prerequisites', curriculumController.listPrerequisites);
router.get('/prerequisites/:subjectId', curriculumController.getPrerequisitesForSubject);
router.post('/prerequisites', authMiddleware, curriculumController.addPrerequisite);
router.delete('/prerequisites/:id', authMiddleware, curriculumController.deletePrerequisite);

router.get('/conditions', curriculumController.listConditions);
router.get('/conditions/:subjectId', curriculumController.getConditionForSubject);
router.post('/conditions', authMiddleware, curriculumController.createOrUpdateCondition);

export default router;
