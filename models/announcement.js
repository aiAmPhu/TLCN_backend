import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Announcement = sequelize.define('Announcement', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Tiêu đề không được để trống'
            },
            len: {
                args: [1, 255],
                msg: 'Tiêu đề phải từ 1 đến 255 ký tự'
            }
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Nội dung không được để trống'
            }
        }
    },
    type: {
        type: DataTypes.ENUM('general', 'admission', 'exam', 'urgent', 'event'),
        defaultValue: 'general',
        allowNull: false
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
        allowNull: false
    },
    isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    publishedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'userId'
        }
    },
    viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    isPinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    attachments: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of attachment objects with filename, url, type, size'
    },
    tags: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of tag strings for categorization'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'announcements',
    timestamps: true,
    indexes: [
        {
            fields: ['type', 'isPublished']
        },
        {
            fields: ['publishedAt']
        },
        {
            fields: ['priority', 'isPinned']
        }
    ]
});

export default Announcement; 