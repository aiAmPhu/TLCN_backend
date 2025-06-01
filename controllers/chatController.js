import ChatMessage from '../models/chatMessage.js';
import { getIO, isUserOnline } from '../services/socketService.js';
import { Op } from 'sequelize';

// Admin: Get all messages
export const getAllMessages = async (req, res) => {
    try {
        const messages = await ChatMessage.findAll({
            where: {
                isDeleted: false
            },
            order: [['timestamp', 'ASC']] // Đổi DESC thành ASC
        });
        res.json(messages);
    } catch (error) {
        console.error('Error in getAllMessages:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get chat history for a room
export const getChatHistory = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.userId;

        const messages = await ChatMessage.findAll({
            where: { 
                roomId,
                isDeleted: false,
                [Op.or]: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            order: [['timestamp', 'ASC']]
        });

        // Mark messages as read
        await ChatMessage.update(
            { status: 'read' },
            {
                where: {
                    roomId,
                    receiverId: userId,
                    status: { [Op.ne]: 'read' }
                }
            }
        );

        // Notify sender that messages are read
        const io = getIO();
        if (io) {
            const unreadMessages = messages.filter(msg => 
                msg.senderId !== userId && msg.status !== 'read'
            );
            unreadMessages.forEach(msg => {
                io.to(`user_${msg.senderId}`).emit('message_status', {
                    messageId: msg.id,
                    status: 'read'
                });
            });
        }

        res.json(messages);
    } catch (error) {
        console.error('Error in getChatHistory:', error);
        res.status(500).json({ message: error.message });
    }
};

// Send a new message
export const sendMessage = async (req, res) => {
    try {
        const { roomId, content, receiverId } = req.body;
        
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ 
                message: 'User not authenticated',
                details: 'Missing or invalid user ID in token'
            });
        }

        const senderId = req.user.userId;
        
        if (!roomId || !content || !receiverId) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                details: {
                    roomId: !roomId ? 'Room ID is required' : null,
                    content: !content ? 'Content is required' : null,
                    receiverId: !receiverId ? 'Receiver ID is required' : null
                }
            });
        }

        const message = await ChatMessage.create({
            roomId,
            senderId,
            receiverId,
            content,
            status: 'sent'
        });

        const io = getIO();
        if (io) {
            // Emit to room
            io.to(roomId).emit('receive_message', {
                ...message.toJSON(),
                timestamp: new Date()
            });

            // Emit to receiver's personal room if they're not in the chat room
            io.to(`user_${receiverId}`).emit('new_message_notification', {
                roomId,
                senderId,
                content
            });
        }

        res.status(201).json(message);
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            details: error.message
        });
    }
};

// Update message status
export const updateMessageStatus = async (req, res) => {
    try {
        const { messageId, status } = req.body;
        const userId = req.user.userId;

        const message = await ChatMessage.findOne({
            where: {
                id: messageId,
                [Op.or]: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            }
        });

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        await message.update({ status });

        // Notify sender about status change
        const io = getIO();
        if (io) {
            io.to(`user_${message.senderId}`).emit('message_status', {
                messageId,
                status
            });
        }

        res.json(message);
    } catch (error) {
        console.error('Error in updateMessageStatus:', error);
        res.status(500).json({ message: error.message });
    }
};

// Add reaction to message
export const addReaction = async (req, res) => {
    try {
        const { messageId, reaction } = req.body;
        const userId = req.user.userId;

        const message = await ChatMessage.findOne({
            where: {
                id: messageId,
                [Op.or]: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            }
        });

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        const reactions = message.reactions || {};
        reactions[userId] = reaction;
        await message.update({ reactions });

        // Notify all participants about the reaction
        const io = getIO();
        if (io) {
            io.to(message.roomId).emit('message_reaction', {
                messageId,
                reaction,
                userId
            });
        }

        res.json(message);
    } catch (error) {
        console.error('Error in addReaction:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete message
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.userId;

        const message = await ChatMessage.findOne({
            where: {
                id: messageId,
                senderId: userId // Only sender can delete
            }
        });

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        await message.update({
            isDeleted: true,
            deletedAt: new Date()
        });

        // Notify all participants about the deletion
        const io = getIO();
        if (io) {
            io.to(message.roomId).emit('message_deleted', {
                messageId
            });
        }

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error in deleteMessage:', error);
        res.status(500).json({ message: error.message });
    }
};

// Search messages
export const searchMessages = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user.userId;

        const messages = await ChatMessage.findAll({
            where: {
                content: { [Op.like]: `%${query}%` },
                isDeleted: false,
                [Op.or]: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            order: [['timestamp', 'DESC']]
        });

        res.json(messages);
    } catch (error) {
        console.error('Error in searchMessages:', error);
        res.status(500).json({ message: error.message });
    }
};