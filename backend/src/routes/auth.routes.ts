import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/register -> register user
router.post('/register', register);

// POST /api/auth/login -> login user
router.post('/login', login);

// GET /api/auth/me -> get current user (protected)
router.get('/me', verifyToken, getMe);

// PUT /api/auth/profile -> update user profile (protected)
router.put('/profile', verifyToken, updateProfile);

export default router;
