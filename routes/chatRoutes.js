import express from 'express';
import { getChatHistory, sendMessage, markAsRead, getAllMessages } from '../controllers/chatController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes
router.get('/admin/all-messages', authenticate, authorizeRoles('admin'), getAllMessages);

// User routes (requires authentication)
router.get('/history/:roomId', authenticate, getChatHistory);
router.post('/send', authenticate, sendMessage);
router.post('/read', authenticate, markAsRead);

export default router;