import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  roomQuerySchema,
  createRoomSchema,
  updateRoomSchema,
  registrationQuerySchema,
  createRegistrationSchema,
  idParamSchema,
} from '@/validators/portal.validator.js';
import {
  getKtxStats,
  getRoomList,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRegistrationList,
  getRegistrationById,
  createRegistration,
  updateRegistration,
  approveRegistration,
  rejectRegistration,
  deleteRegistration,
} from '@/controllers/ktx.controller.js';

const router = Router();
router.use(authMiddleware);

// KTX Dashboard
router.get('/stats', getKtxStats);

// Rooms
router.get('/rooms', validate(roomQuerySchema, 'query'), getRoomList);
router.get('/rooms/:id', validate(idParamSchema, 'params'), getRoomById);
router.post('/rooms', validate(createRoomSchema), createRoom);
router.patch('/rooms/:id', validate(idParamSchema, 'params'), validate(updateRoomSchema), updateRoom);
router.delete('/rooms/:id', validate(idParamSchema, 'params'), deleteRoom);

// Registrations
router.get('/registrations', validate(registrationQuerySchema, 'query'), getRegistrationList);
router.get('/registrations/:id', validate(idParamSchema, 'params'), getRegistrationById);
router.post('/registrations', validate(createRegistrationSchema), createRegistration);
router.patch('/registrations/:id', validate(idParamSchema, 'params'), validate(createRegistrationSchema), updateRegistration);
router.post('/registrations/:id/approve', validate(idParamSchema, 'params'), approveRegistration);
router.post('/registrations/:id/reject', validate(idParamSchema, 'params'), rejectRegistration);
router.delete('/registrations/:id', validate(idParamSchema, 'params'), deleteRegistration);

export default router;
