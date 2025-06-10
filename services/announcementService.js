import Announcement from '../models/announcement.js';
import User from '../models/user.js';
import cloudinary from '../config/cloudinary.js';
import { Op } from 'sequelize';

class AnnouncementService {
    // Get all announcements with pagination and filters
    async getAllAnnouncements(options = {}) {
        const {
            page = 1,
            limit = 10,
            type,
            priority,
            isPublished,
            authorId,
            search,
            includeExpired = false
        } = options;

        const offset = (page - 1) * limit;
        const where = {};

        // Build where conditions
        if (type) where.type = type;
        if (priority) where.priority = priority;
        if (isPublished !== undefined) where.isPublished = isPublished;
        if (authorId) where.authorId = authorId;

        // Search in title and content
        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { content: { [Op.like]: `%${search}%` } }
            ];
        }

        // Filter out expired announcements unless explicitly requested
        if (!includeExpired) {
            where[Op.and] = where[Op.and] || [];
            where[Op.and].push({
                [Op.or]: [
                    { expiresAt: null },
                    { expiresAt: { [Op.gt]: new Date() } }
                ]
            });
        }

        const result = await Announcement.findAndCountAll({
            where,
            include: [{
                model: User,
                as: 'author',
                attributes: ['userId', 'name', 'email']
            }],
            order: [
                ['isPinned', 'DESC'],
                ['priority', 'DESC'],
                ['publishedAt', 'DESC'],
                ['createdAt', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return {
            announcements: result.rows,
            totalCount: result.count,
            totalPages: Math.ceil(result.count / limit),
            currentPage: parseInt(page),
            hasMore: offset + result.rows.length < result.count
        };
    }

    // Get published announcements for public view
    async getPublishedAnnouncements(options = {}) {
        return this.getAllAnnouncements({
            ...options,
            isPublished: true,
            includeExpired: false
        });
    }

    // Get announcement by ID
    async getAnnouncementById(id, incrementView = false) {
        const announcement = await Announcement.findByPk(id, {
            include: [{
                model: User,
                as: 'author',
                attributes: ['userId', 'name', 'email']
            }]
        });

        if (!announcement) {
            throw new Error('Không tìm thấy thông báo');
        }

        // Increment view count if requested
        if (incrementView) {
            await announcement.increment('viewCount');
        }

        return announcement;
    }

    // Create new announcement
    async createAnnouncement(data, authorId) {
        const announcementData = {
            ...data,
            authorId,
            publishedAt: data.isPublished ? new Date() : null
        };

        const announcement = await Announcement.create(announcementData);
        
        // Fetch the created announcement with author info
        return this.getAnnouncementById(announcement.id);
    }

    // Update announcement
    async updateAnnouncement(id, data, userId, userRole) {
        const announcement = await this.getAnnouncementById(id);

        // Check permissions
        if (userRole !== 'admin' && announcement.authorId !== userId) {
            throw new Error('Bạn không có quyền cập nhật thông báo này');
        }

        // Handle publish status change
        if (data.isPublished && !announcement.isPublished) {
            data.publishedAt = new Date();
        } else if (!data.isPublished && announcement.isPublished) {
            data.publishedAt = null;
        }

        await announcement.update(data);
        return this.getAnnouncementById(id);
    }

    // Delete announcement
    async deleteAnnouncement(id, userId, userRole) {
        const announcement = await this.getAnnouncementById(id);

        // Check permissions
        if (userRole !== 'admin' && announcement.authorId !== userId) {
            throw new Error('Bạn không có quyền xóa thông báo này');
        }

        // Delete attachments from cloudinary
        if (announcement.attachments && announcement.attachments.length > 0) {
            for (const attachment of announcement.attachments) {
                try {
                    // Extract public_id from cloudinary URL
                    const publicId = this.extractPublicIdFromUrl(attachment.url);
                    if (publicId) {
                        await cloudinary.uploader.destroy(publicId);
                    }
                } catch (error) {
                    console.error('Error deleting attachment from cloudinary:', error);
                }
            }
        }

        await announcement.destroy();
        return { message: 'Xóa thông báo thành công' };
    }

    // Upload attachments to cloudinary
    async uploadAttachments(files) {
        const uploadPromises = files.map(async (file) => {
            const uploadOptions = {
                folder: 'announcements',
                resource_type: 'auto', // Supports images, videos, and raw files
            };

            // Set specific options for different file types
            if (file.mimetype.startsWith('image/')) {
                uploadOptions.transformation = [
                    { quality: 'auto', fetch_format: 'auto' }
                ];
            }

            const result = await cloudinary.uploader.upload(file.path, uploadOptions);

            return {
                filename: file.originalname,
                url: result.secure_url,
                publicId: result.public_id,
                type: file.mimetype,
                size: result.bytes,
                format: result.format
            };
        });

        return Promise.all(uploadPromises);
    }

    // Delete attachment from cloudinary
    async deleteAttachment(publicId) {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result;
        } catch (error) {
            console.error('Error deleting attachment:', error);
            throw new Error('Không thể xóa file đính kèm');
        }
    }

    // Extract public_id from cloudinary URL
    extractPublicIdFromUrl(url) {
        try {
            const parts = url.split('/');
            const uploadIndex = parts.findIndex(part => part === 'upload');
            if (uploadIndex === -1) return null;

            const pathParts = parts.slice(uploadIndex + 2); // Skip version info
            const fileWithExt = pathParts.join('/');
            const publicId = fileWithExt.substring(0, fileWithExt.lastIndexOf('.'));
            return publicId;
        } catch (error) {
            console.error('Error extracting public_id:', error);
            return null;
        }
    }

    // Toggle pin status
    async togglePin(id, userId, userRole) {
        if (userRole !== 'admin') {
            throw new Error('Chỉ admin mới có thể ghim thông báo');
        }

        const announcement = await this.getAnnouncementById(id);
        await announcement.update({ isPinned: !announcement.isPinned });
        
        return this.getAnnouncementById(id);
    }

    // Get announcement statistics
    async getStatistics() {
        const stats = await Announcement.findAll({
            attributes: [
                'type',
                [Announcement.sequelize.fn('COUNT', Announcement.sequelize.col('id')), 'count']
            ],
            group: ['type']
        });

        const totalAnnouncements = await Announcement.count();
        const publishedCount = await Announcement.count({ where: { isPublished: true } });
        const pinnedCount = await Announcement.count({ where: { isPinned: true } });

        return {
            total: totalAnnouncements,
            published: publishedCount,
            pinned: pinnedCount,
            byType: stats.reduce((acc, stat) => {
                acc[stat.type] = parseInt(stat.dataValues.count);
                return acc;
            }, {})
        };
    }
}

export default new AnnouncementService();