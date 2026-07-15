import { Router } from 'express';
import { admissionController } from '../controllers/admission.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// ─── AdmissionBatch ─────────────────────────────────────────────────────────────
router.get('/batches', admissionController.listBatches);
router.get('/batches/:id', admissionController.getBatchById);
router.post('/batches', authMiddleware, admissionController.createBatch);
router.patch('/batches/:id', authMiddleware, admissionController.updateBatch);
router.delete('/batches/:id', authMiddleware, admissionController.deleteBatch);

// ─── AdmissionStudent ───────────────────────────────────────────────────────────
router.get('/students', admissionController.listStudents);
router.get('/students/:id', admissionController.getStudentById);
router.post('/students', authMiddleware, admissionController.createStudent);
router.patch('/students/:id', authMiddleware, admissionController.updateStudent);
router.patch('/students/:id/enroll', authMiddleware, admissionController.enrollStudent);
router.delete('/students/:id', authMiddleware, admissionController.deleteStudent);

export default router;
