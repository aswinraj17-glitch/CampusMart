import { Router } from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlist.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken); // All wishlist routes require login

router.get('/', getWishlist);
router.post('/:productId', toggleWishlist);

export default router;
