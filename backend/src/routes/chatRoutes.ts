import express from 'express';
import { sendMessage, getChatHistory } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/history', getChatHistory);
router.post('/message', sendMessage);

export default router;