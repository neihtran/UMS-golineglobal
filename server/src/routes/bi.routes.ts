import { Router } from 'express';

const router = Router();

// GET /api/bi/dashboard
router.get('/dashboard', (req, res) => {
  res.json({ success: true, data: {}, message: 'BI Dashboard' });
});

export default router;
