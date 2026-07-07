import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  announcementQuerySchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
  idParamSchema,
} from '@/validators/portal.validator.js';
import {
  getPortalStats,
  getAnnouncementList,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getNotificationList,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/controllers/portal.controller.js';

const router = Router();
router.use(authMiddleware);

// Portal Dashboard
router.get('/stats', getPortalStats);

// Announcements
router.get('/announcements', validate(announcementQuerySchema, 'query'), getAnnouncementList);
router.get('/announcements/:id', validate(idParamSchema, 'params'), getAnnouncementById);
router.post('/announcements', validate(createAnnouncementSchema), createAnnouncement);
router.patch('/announcements/:id', validate(idParamSchema, 'params'), validate(updateAnnouncementSchema), updateAnnouncement);
router.delete('/announcements/:id', validate(idParamSchema, 'params'), deleteAnnouncement);

// Notifications
router.get('/notifications', getNotificationList);
router.post('/notifications/:id/read', validate(idParamSchema, 'params'), markNotificationRead);
router.post('/notifications/read-all', markAllNotificationsRead);

export default router;
