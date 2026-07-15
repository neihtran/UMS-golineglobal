import { Router } from 'express';

const router = Router();

// GET /api/dms/documents
router.get('/documents', (req, res) => {
  res.json({ success: true, data: [], message: 'Documents list' });
});

export default router;
