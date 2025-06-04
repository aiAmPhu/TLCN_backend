import express from 'express';
import { getUserNotifications, markAsRead } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user notifications
router.get('/user/:userId', authenticate, getUserNotifications);

// Mark notification as read
router.put('/:notificationId/read', authenticate, markAsRead);

export default router; 