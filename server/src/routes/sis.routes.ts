import { Router } from 'express';
import { sisController } from '../controllers/sis.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { auditMiddleware } from '../middleware/audit.middleware.js';
import { validate } from '../middleware/error.middleware.js';
import {
  createStudentSchema, updateStudentSchema,
  createSubjectSchema, updateSubjectSchema,
  createCourseSchema, updateCourseSchema,
  createEnrollmentSchema, gradeEnrollmentSchema,
  createCurriculumSchema, updateCurriculumSchema,
} from '../validators/sis.validator.js';

const router = Router();

router.use(authMiddleware);

// ─── Students ───────────────────────────────────────────────────────────────

router.get('/students', sisController.listStudents);
router.get('/students/stats', sisController.getStudentStats);
router.get('/students/:id', sisController.getStudentById);

router.post('/students', roleMiddleware(['ADMIN', 'NHAN_VIEN', 'GIAO_VIEN']), auditMiddleware('Student'), validate(createStudentSchema), sisController.createStudent);
router.patch('/students/:id', roleMiddleware(['ADMIN', 'NHAN_VIEN', 'GIAO_VIEN']), auditMiddleware('Student'), validate(updateStudentSchema), sisController.updateStudent);
router.delete('/students/:id', roleMiddleware(['ADMIN']), auditMiddleware('Student'), sisController.deleteStudent);

// ─── Subjects ───────────────────────────────────────────────────────────────

router.get('/subjects', sisController.listSubjects);
router.get('/subjects/:id', sisController.getSubjectById);
router.post('/subjects', roleMiddleware(['ADMIN', 'NHAN_VIEN', 'GIAO_VIEN']), auditMiddleware('Subject'), validate(createSubjectSchema), sisController.createSubject);
router.patch('/subjects/:id', roleMiddleware(['ADMIN', 'NHAN_VIEN', 'GIAO_VIEN']), auditMiddleware('Subject'), validate(updateSubjectSchema), sisController.updateSubject);
router.delete('/subjects/:id', roleMiddleware(['ADMIN']), auditMiddleware('Subject'), sisController.deleteSubject);

// ─── Courses ────────────────────────────────────────────────────────────────

router.get('/courses', sisController.listCourses);
router.get('/courses/:id', sisController.getCourseById);
router.post('/courses', roleMiddleware(['ADMIN', 'NHAN_VIEN', 'GIAO_VIEN']), auditMiddleware('Course'), validate(createCourseSchema), sisController.createCourse);
router.patch('/courses/:id', roleMiddleware(['ADMIN', 'NHAN_VIEN', 'GIAO_VIEN']), auditMiddleware('Course'), validate(updateCourseSchema), sisController.updateCourse);
router.delete('/courses/:id', roleMiddleware(['ADMIN']), auditMiddleware('Course'), sisController.deleteCourse);

// ─── Enrollments ────────────────────────────────────────────────────────────

router.get('/enrollments', sisController.listEnrollments);
router.post('/enrollments', auditMiddleware('Enrollment'), validate(createEnrollmentSchema), sisController.createEnrollment);
router.post('/enrollments/:id/grade', roleMiddleware(['ADMIN', 'GIAO_VIEN']), auditMiddleware('Enrollment'), validate(gradeEnrollmentSchema), sisController.gradeEnrollment);
router.delete('/enrollments/:id', auditMiddleware('Enrollment'), sisController.deleteEnrollment);

// ─── Curricula ──────────────────────────────────────────────────────────────

router.get('/curricula', sisController.listCurricula);
router.get('/curricula/:id', sisController.getCurriculumById);
router.post('/curricula', roleMiddleware(['ADMIN', 'NHAN_VIEN']), auditMiddleware('Curriculum'), validate(createCurriculumSchema), sisController.createCurriculum);
router.patch('/curricula/:id', roleMiddleware(['ADMIN', 'NHAN_VIEN']), auditMiddleware('Curriculum'), validate(updateCurriculumSchema), sisController.updateCurriculum);
router.delete('/curricula/:id', roleMiddleware(['ADMIN']), auditMiddleware('Curriculum'), sisController.deleteCurriculum);

export default router;