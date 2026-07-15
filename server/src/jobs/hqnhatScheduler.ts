import { Router } from 'express';

const router = Router();

// POST /api/jobs/hqnhat/sync
router.post('/hqnhat/sync', (req, res) => {
  res.json({ success: true, message: 'Sync triggered' });
});

export default router;

// Scheduler functions
export function startHqnhatScheduler() {
  console.log('📅 HQNHAT scheduler started');
}

export function stopAllHqnhatJobs() {
  console.log('📅 All HQNHAT jobs stopped');
}
