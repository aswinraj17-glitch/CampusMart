import { Router } from 'express';
import { createTransaction, getUserTransactions } from '../controllers/transaction.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Protected routes
router.post('/', verifyToken, createTransaction);
router.get('/me', verifyToken, getUserTransactions);

export default router;
