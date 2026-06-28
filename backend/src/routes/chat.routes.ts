import { Router } from 'express';
import { getChats, getMessages, sendMessage } from '../controllers/chat.controller';
import { verifyToken, verifyStudentStatus } from '../middleware/auth.middleware';

const router = Router();

// Only verified students can chat
router.use(verifyToken);
router.use(verifyStudentStatus);

router.get('/', getChats);
router.get('/:chatId', getMessages);
router.post('/', sendMessage);

export default router;
