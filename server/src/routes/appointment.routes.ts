import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { validate } from '@/middleware/validate.middleware.js';
import { idParamSchema } from '@/validators/shared.validator.js';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentStats,
} from '@/controllers/appointment.controller.js';
import {
  appointmentQuerySchema,
  createAppointmentSchema,
  updateAppointmentSchema,
} from '@/validators/appointment.validator.js';

const router = Router();
router.use(authMiddleware);

router.get('/', validate(appointmentQuerySchema, 'query'), getAppointments);
router.get('/stats', getAppointmentStats);
router.get('/:id', validate(idParamSchema, 'params'), getAppointmentById);
router.post('/', validate(createAppointmentSchema), createAppointment);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateAppointmentSchema), updateAppointment);
router.delete('/:id', validate(idParamSchema, 'params'), deleteAppointment);

export default router;
