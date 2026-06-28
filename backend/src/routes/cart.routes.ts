import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cart.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken); // All cart routes require login

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeCartItem);
router.delete('/', clearCart);

export default router;
