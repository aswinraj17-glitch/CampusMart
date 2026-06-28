import { Router } from 'express';
import { getAllCategories, createCategory } from '../controllers/category.controller';
import { verifySeller } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getAllCategories);
router.post('/', verifySeller, createCategory);

export default router;
