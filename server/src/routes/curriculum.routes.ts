import { Router } from 'express';
import { curriculumController } from '../controllers/curriculum.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// ─── SubjectType ─────────────────────────────────────────────────────────────
router.get('/subject-types', curriculumController.listSubjectTypes);
router.get('/subject-types/:id', curriculumController.getSubjectTypeById);
router.post('/subject-types', authMiddleware, curriculumController.createSubjectType);
router.patch('/subject-types/:id', authMiddleware, curriculumController.updateSubjectType);
router.delete('/subject-types/:id', authMiddleware, curriculumController.deleteSubjectType);

// ─── SubjectPrerequisite ─────────────────────────────────────────────────────
router.get('/prerequisites', curriculumController.listPrerequisites);
router.get('/prerequisites/:subjectId', curriculumController.getPrerequisitesForSubject);
router.post('/prerequisites', authMiddleware, curriculumController.addPrerequisite);
router.delete('/prerequisites/:id', authMiddleware, curriculumController.deletePrerequisite);

// ─── SubjectCondition ───────────────────────────────────────────────────────
router.get('/conditions', curriculumController.listConditions);
router.get('/conditions/:subjectId', curriculumController.getConditionForSubject);
router.post('/conditions', authMiddleware, curriculumController.createOrUpdateCondition);

export default router;
