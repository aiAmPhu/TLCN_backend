import express from 'express';
import { 
    getAllAnnouncements,
    getPublishedAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    deleteAttachment,
    togglePin,
    getStatistics,
    upload
} from '../controllers/announcementController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/public', getPublishedAnnouncements);
router.get('/public/:id', getAnnouncementById);

// Protected routes (authentication required)

// Admin only routes
router.get('/admin', authenticate, authorizeRoles('admin'), getAllAnnouncements);
router.get('/admin/statistics', authenticate, authorizeRoles('admin'), getStatistics);
router.post(
    '/admin', 
    authenticate, 
    authorizeRoles('admin'), 
    upload.array('attachments', 5), 
    createAnnouncement
);
router.put(
    '/admin/:id', 
    authenticate, 
    authorizeRoles('admin'), 
    upload.array('attachments', 5), 
    updateAnnouncement
);
router.delete('/admin/:id', authenticate, authorizeRoles('admin'), deleteAnnouncement);
router.patch('/admin/:id/toggle-pin', authenticate, authorizeRoles('admin'), togglePin);
router.delete('/admin/:id/attachments/:attachmentId', authenticate, authorizeRoles('admin'), deleteAttachment);

// Admin can also view any announcement (including unpublished)
router.get('/admin/:id', authenticate, authorizeRoles('admin'), getAnnouncementById);

export default router;