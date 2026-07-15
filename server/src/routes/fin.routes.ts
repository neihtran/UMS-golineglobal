import { Router } from 'express';

const router = Router();

// GET /api/fin/tuition
router.get('/tuition', (req, res) => {
  res.json({ success: true, data: [], message: 'Tuition list' });
});

export default router;
