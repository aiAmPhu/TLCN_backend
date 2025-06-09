import Notification from '../models/notification.js';
import { getIO } from '../services/socketService.js';

// Get all notifications for a user
export const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.params.userId },
            order: [['createdAt', 'DESC']]
        });
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        if (notification.userId !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await notification.update({ read: true });
        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Error marking notification as read' });
    }
};

// Mark all notifications as read for a user
export const markAllAsRead = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        // Check if user is authorized to mark their own notifications
        if (userId !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Update all unread notifications for this user
        const [updatedCount] = await Notification.update(
            { read: true },
            { 
                where: { 
                    userId: userId,
                    read: false 
                }
            }
        );

        res.json({ 
            message: 'All notifications marked as read',
            updatedCount 
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Error marking all notifications as read' });
    }
};

// Create a new notification
export const createNotification = async (userId, title, message, type = 'message') => {
    try {
        const notification = await Notification.create({
            userId,
            title,
            message,
            type
        });

        // Emit notification to user's socket room
        const io = getIO();
        io.to(`user_${userId}`).emit('notification', notification);

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Create notification for transcript status change
export const createTranscriptNotification = async (userId, status, feedback = '') => {
    let title, message;
    
    switch (status) {
        case 'accepted':
            title = 'Học bạ đã được duyệt';
            message = 'Học bạ của bạn đã được duyệt thành công.';
            break;
        case 'rejected':
            title = 'Học bạ bị từ chối';
            message = `Học bạ của bạn bị từ chối. Lý do: ${feedback}`;
            break;
        default:
            return;
    }

    return createNotification(userId, title, message, 'transcript');
};

// Create notification for learning process status change
export const createLearningProcessNotification = async (userId, status, feedback = null) => {
    try {
        const title = status === 'accepted' 
            ? 'Quá trình học tập được chấp nhận' 
            : 'Quá trình học tập bị từ chối';
        
        const message = status === 'accepted'
            ? 'Quá trình học tập của bạn đã được chấp nhận.'
            : `Quá trình học tập của bạn bị từ chối. Lý do: ${feedback}`;

        const notification = await Notification.create({
            userId,
            title,
            message,
            type: 'learning_process',
            read: false
        });

        // Emit notification through Socket.IO
        const io = getIO();
        io.to(`user_${userId}`).emit('notification', notification);

        return notification;
    } catch (error) {
        console.error('Error creating learning process notification:', error);
        throw error;
    }
};

// Create notification for photo status change
export const createPhotoNotification = async (userId, status, feedback = null) => {
    try {
        const title = status === 'accepted' 
            ? 'Ảnh hồ sơ được chấp nhận' 
            : 'Ảnh hồ sơ bị từ chối';
        
        const message = status === 'accepted'
            ? 'Ảnh hồ sơ của bạn đã được chấp nhận.'
            : `Ảnh hồ sơ của bạn bị từ chối. Lý do: ${feedback}`;

        const notification = await Notification.create({
            userId,
            title,
            message,
            type: 'photo',
            read: false
        });

        // Emit notification through Socket.IO
        const io = getIO();
        io.to(`user_${userId}`).emit('notification', notification);

        return notification;
    } catch (error) {
        console.error('Error creating photo notification:', error);
        throw error;
    }
};

// Create notification for information status change
export const createInformationNotification = async (userId, status, feedback = '') => {
    let title, message;
    
    switch (status) {
        case 'accepted':
            title = 'Thông tin cá nhân đã được duyệt';
            message = 'Thông tin cá nhân của bạn đã được duyệt thành công.';
            break;
        case 'rejected':
            title = 'Thông tin cá nhân bị từ chối';
            message = `Thông tin cá nhân của bạn bị từ chối. Lý do: ${feedback}`;
            break;
        default:
            return;
    }

    return createNotification(userId, title, message, 'information');
};

export const createAdmissionNotification = async (userId, status, feedback = null) => {
    try {
        const title = status === 'accepted' 
            ? 'Thông tin tuyển sinh được chấp nhận' 
            : 'Thông tin tuyển sinh bị từ chối';
        
        const message = status === 'accepted'
            ? 'Thông tin tuyển sinh của bạn đã được chấp nhận.'
            : `Thông tin tuyển sinh của bạn bị từ chối. Lý do: ${feedback}`;

        const notification = await Notification.create({
            userId,
            title,
            message,
            type: 'admission',
            read: false
        });

        // Emit notification through Socket.IO
        const io = getIO();
        io.to(`user_${userId}`).emit('notification', notification);

        return notification;
    } catch (error) {
        console.error('Error creating admission notification:', error);
        throw error;
    }
}; 