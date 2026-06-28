import { Router } from 'express';
import { getNotifications, markAsRead, readAllNotifications } from '../controllers/notification.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', getNotifications);
router.put('/read-all', readAllNotifications);
router.put('/:id/read', markAsRead);

export default router;
