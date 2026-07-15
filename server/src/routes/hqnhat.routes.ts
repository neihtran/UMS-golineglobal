import { Router } from 'express';

const router = Router();

// GET /api/hqnhat/faculties
router.get('/faculties', (req, res) => {
  res.json({ success: true, data: [], message: 'Faculties' });
});

// GET /api/hqnhat/majors
router.get('/majors', (req, res) => {
  res.json({ success: true, data: [], message: 'Majors' });
});

// GET /api/hqnhat/curriculums
router.get('/curriculums', (req, res) => {
  res.json({ success: true, data: [], message: 'Curriculums' });
});

// POST /api/hqnhat/sync
router.post('/sync', (req, res) => {
  res.json({ success: true, message: 'Sync triggered' });
});

export default router;
