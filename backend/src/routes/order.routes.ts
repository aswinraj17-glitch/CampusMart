import { Router } from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getSellerIncomingOrders
} from '../controllers/order.controller';
import { verifyToken, verifySeller } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken); // All order routes require authentication

router.post('/', createOrder);
router.get('/me', getUserOrders);
router.get('/seller', verifySeller, getSellerIncomingOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', verifySeller, updateOrderStatus);

export default router;
