import announcementService from '../services/announcementService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/announcements';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    // Allow images and PDFs
    const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload ảnh (JPEG, PNG, GIF, WebP) và tài liệu (PDF, DOC, DOCX)'), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Maximum 5 files
    }
});

// Get all announcements (admin only)
export const getAllAnnouncements = async (req, res) => {
    try {
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            type: req.query.type,
            priority: req.query.priority,
            isPublished: req.query.isPublished === 'true' ? true : req.query.isPublished === 'false' ? false : undefined,
            authorId: req.query.authorId ? parseInt(req.query.authorId) : undefined,
            search: req.query.search,
            includeExpired: req.query.includeExpired === 'true'
        };

        const result = await announcementService.getAllAnnouncements(options);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error getting announcements:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách thông báo',
            error: error.message
        });
    }
};

// Get published announcements (public)
export const getPublishedAnnouncements = async (req, res) => {
    try {
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            type: req.query.type,
            priority: req.query.priority,
            search: req.query.search
        };

        const result = await announcementService.getPublishedAnnouncements(options);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error getting published announcements:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách thông báo',
            error: error.message
        });
    }
};

// Get announcement by ID
export const getAnnouncementById = async (req, res) => {
    try {
        const { id } = req.params;
        const incrementView = req.query.incrementView === 'true';
        
        const announcement = await announcementService.getAnnouncementById(id, incrementView);
        
        // Check if user can view unpublished announcements
        if (!announcement.isPublished && (!req.user || req.user.role !== 'admin')) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông báo'
            });
        }

        res.json({
            success: true,
            data: announcement
        });
    } catch (error) {
        console.error('Error getting announcement:', error);
        if (error.message === 'Không tìm thấy thông báo') {
            res.status(404).json({
                success: false,
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thông báo',
                error: error.message
            });
        }
    }
};

// Create new announcement
export const createAnnouncement = async (req, res) => {
    try {
        const authorId = req.user.userId;
        let announcementData = { ...req.body };
        
        // Parse JSON fields
        if (typeof announcementData.tags === 'string') {
            try {
                announcementData.tags = JSON.parse(announcementData.tags);
            } catch (e) {
                announcementData.tags = announcementData.tags.split(',').map(tag => tag.trim());
            }
        }

        // Handle file uploads
        if (req.files && req.files.length > 0) {
            const attachments = await announcementService.uploadAttachments(req.files);
            announcementData.attachments = attachments;

            // Clean up temporary files
            req.files.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                } catch (error) {
                    console.error('Error deleting temp file:', error);
                }
            });
        }

        const announcement = await announcementService.createAnnouncement(announcementData, authorId);
        
        res.status(201).json({
            success: true,
            message: 'Tạo thông báo thành công',
            data: announcement
        });
    } catch (error) {
        console.error('Error creating announcement:', error);
        
        // Clean up files if error occurs
        if (req.files) {
            req.files.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                } catch (unlinkError) {
                    console.error('Error deleting temp file after error:', unlinkError);
                }
            });
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo thông báo',
            error: error.message
        });
    }
};

// Update announcement
export const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;
        let updateData = { ...req.body };

        // Parse JSON fields
        if (typeof updateData.tags === 'string') {
            try {
                updateData.tags = JSON.parse(updateData.tags);
            } catch (e) {
                updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
            }
        }

        // Handle new file uploads
        if (req.files && req.files.length > 0) {
            const newAttachments = await announcementService.uploadAttachments(req.files);
            
            // Get existing attachments
            const existingAnnouncement = await announcementService.getAnnouncementById(id);
            const existingAttachments = existingAnnouncement.attachments || [];
            
            updateData.attachments = [...existingAttachments, ...newAttachments];

            // Clean up temporary files
            req.files.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                } catch (error) {
                    console.error('Error deleting temp file:', error);
                }
            });
        }

        const announcement = await announcementService.updateAnnouncement(id, updateData, userId, userRole);
        
        res.json({
            success: true,
            message: 'Cập nhật thông báo thành công',
            data: announcement
        });
    } catch (error) {
        console.error('Error updating announcement:', error);
        
        // Clean up files if error occurs
        if (req.files) {
            req.files.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                } catch (unlinkError) {
                    console.error('Error deleting temp file after error:', unlinkError);
                }
            });
        }

        if (error.message === 'Không tìm thấy thông báo') {
            res.status(404).json({
                success: false,
                message: error.message
            });
        } else if (error.message === 'Bạn không có quyền cập nhật thông báo này') {
            res.status(403).json({
                success: false,
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi cập nhật thông báo',
                error: error.message
            });
        }
    }
};

// Delete announcement
export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;
        
        const result = await announcementService.deleteAnnouncement(id, userId, userRole);
        
        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        
        if (error.message === 'Không tìm thấy thông báo') {
            res.status(404).json({
                success: false,
                message: error.message
            });
        } else if (error.message === 'Bạn không có quyền xóa thông báo này') {
            res.status(403).json({
                success: false,
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa thông báo',
                error: error.message
            });
        }
    }
};

// Delete attachment
export const deleteAttachment = async (req, res) => {
    try {
        const { id, attachmentId } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;
        
        const announcement = await announcementService.getAnnouncementById(id);
        
        // Check permissions
        if (userRole !== 'admin' && announcement.authorId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xóa file đính kèm này'
            });
        }

        const attachments = announcement.attachments || [];
        const attachmentIndex = attachments.findIndex(att => att.publicId === attachmentId);
        
        if (attachmentIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy file đính kèm'
            });
        }

        // Delete from cloudinary
        await announcementService.deleteAttachment(attachmentId);
        
        // Remove from announcement
        attachments.splice(attachmentIndex, 1);
        await announcement.update({ attachments });
        
        res.json({
            success: true,
            message: 'Xóa file đính kèm thành công'
        });
    } catch (error) {
        console.error('Error deleting attachment:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa file đính kèm',
            error: error.message
        });
    }
};

// Toggle pin status
export const togglePin = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;
        
        const announcement = await announcementService.togglePin(id, userId, userRole);
        
        res.json({
            success: true,
            message: announcement.isPinned ? 'Đã ghim thông báo' : 'Đã bỏ ghim thông báo',
            data: announcement
        });
    } catch (error) {
        console.error('Error toggling pin status:', error);
        
        if (error.message === 'Không tìm thấy thông báo') {
            res.status(404).json({
                success: false,
                message: error.message
            });
        } else if (error.message === 'Chỉ admin mới có thể ghim thông báo') {
            res.status(403).json({
                success: false,
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi thay đổi trạng thái ghim',
                error: error.message
            });
        }
    }
};

// Get statistics
export const getStatistics = async (req, res) => {
    try {
        const stats = await announcementService.getStatistics();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error getting statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê',
            error: error.message
        });
    }
};