import { Router } from 'express';
import { getExchangeRequests, proposeExchange, respondToExchange } from '../controllers/exchange.controller';
import { verifyToken, verifyStudentStatus } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);
router.use(verifyStudentStatus); // Only verified students can swap

router.get('/', getExchangeRequests);
router.post('/', proposeExchange);
router.put('/:requestId', respondToExchange);

export default router;
