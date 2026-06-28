import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllOrders,
  getPendingVerifications,
  respondToVerification
} from '../controllers/admin.controller';
import { verifyAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyAdmin); // All admin routes require admin privileges

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/orders', getAllOrders);
router.get('/verifications', getPendingVerifications);
router.put('/verifications/:userId', respondToVerification);

export default router;
