import express from 'express';
import { 
    getChatHistory, 
    sendMessage, 
    updateMessageStatus, 
    getAllMessages,
    addReaction,
    deleteMessage,
    searchMessages
} from '../controllers/chatController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes
router.get('/admin/all-messages', authenticate, authorizeRoles('admin'), getAllMessages);

// User routes (requires authentication)
router.get('/history/:roomId', authenticate, getChatHistory);
router.post('/send', authenticate, sendMessage);
router.put('/status', authenticate, updateMessageStatus);
router.post('/reaction', authenticate, addReaction);
router.delete('/:messageId', authenticate, deleteMessage);
router.get('/search', authenticate, searchMessages);

export default router;