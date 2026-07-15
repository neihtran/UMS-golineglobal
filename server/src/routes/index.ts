import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import sisRoutes from './sis.routes.js';
import hrmRoutes from './hrm.routes.js';
import dmsRoutes from './dms.routes.js';
import finRoutes from './fin.routes.js';
import biRoutes from './bi.routes.js';
import hqnhatRoutes from './hqnhat.routes.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/sis', sisRoutes);
router.use('/hrm', hrmRoutes);
router.use('/dms', dmsRoutes);
router.use('/fin', finRoutes);
router.use('/bi', biRoutes);
router.use('/hqnhat', hqnhatRoutes);

export default router;
