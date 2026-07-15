import { Router } from 'express';

const router = Router();

// GET /api/users
router.get('/', (req, res) => {
  res.json({ success: true, data: [], message: 'Users list' });
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  res.json({ success: true, message: 'User detail' });
});

export default router;
