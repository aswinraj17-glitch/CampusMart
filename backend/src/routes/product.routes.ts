import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview
} from '../controllers/product.controller';
import { verifyToken, verifySeller, verifyStudentStatus } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes (Only verified students can buy/sell/review)
router.post('/', verifyToken, verifyStudentStatus, createProduct);
router.put('/:id', verifyToken, verifyStudentStatus, updateProduct);
router.delete('/:id', verifyToken, verifyStudentStatus, deleteProduct);
router.post('/:id/reviews', verifyToken, verifyStudentStatus, createProductReview);

export default router;
