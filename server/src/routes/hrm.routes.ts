import { Router } from 'express';
import { hrmController } from '../controllers/hrm.controller.js';

const router = Router();

// VienChuc routes
router.get('/vien-chuc', hrmController.getVienChucList);
router.get('/vien-chuc/:id', hrmController.getVienChucById);
router.post('/vien-chuc', hrmController.createVienChuc);
router.patch('/vien-chuc/:id', hrmController.updateVienChuc);
router.delete('/vien-chuc/:id', hrmController.deleteVienChuc);
router.get('/vien-chuc-stats', hrmController.getVienChucStats);

// Department routes
router.get('/departments', hrmController.getDepartmentList);
router.get('/departments/:id', hrmController.getDepartmentById);
router.post('/departments', hrmController.createDepartment);
router.patch('/departments/:id', hrmController.updateDepartment);
router.delete('/departments/:id', hrmController.deleteDepartment);

export default router;
