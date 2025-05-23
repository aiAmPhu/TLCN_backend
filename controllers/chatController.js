import ChatMessage from '../models/chatMessage.js';
import { getIO } from '../services/socketService.js';
import { Op } from 'sequelize';

// Admin: Get all messages
export const getAllMessages = async (req, res) => {
    try {
        const messages = await ChatMessage.findAll({
            order: [['timestamp', 'DESC']]
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
        const userId = req.user.userId; // Changed from req.user.id to req.user.userId

        const messages = await ChatMessage.findAll({
            where: { 
                roomId,
                [Op.or]: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            order: [['timestamp', 'ASC']]
        });
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
        
        // Validate user authentication
        if (!req.user || !req.user.userId) {
            console.error('User not authenticated or missing userId:', req.user);
            return res.status(401).json({ 
                message: 'User not authenticated',
                details: 'Missing or invalid user ID in token'
            });
        }

        const senderId = req.user.userId;
        
        console.log('Attempting to send message:', {
            roomId,
            content,
            senderId,
            receiverId,
            user: req.user
        });

        // Validate required fields
        if (!roomId || !content || !receiverId) {
            console.error('Missing required fields:', { roomId, content, receiverId });
            return res.status(400).json({ 
                message: 'Missing required fields',
                details: {
                    roomId: !roomId ? 'Room ID is required' : null,
                    content: !content ? 'Content is required' : null,
                    receiverId: !receiverId ? 'Receiver ID is required' : null
                }
            });
        }

        // Validate data types
        if (typeof senderId !== 'number' || typeof receiverId !== 'number') {
            console.error('Invalid ID types:', { senderId, receiverId });
            return res.status(400).json({ 
                message: 'Invalid ID types',
                details: {
                    senderId: typeof senderId,
                    receiverId: typeof receiverId
                }
            });
        }

        // Create the message
        const message = await ChatMessage.create({
            roomId,
            senderId,
            receiverId,
            content
        });

        console.log('Message created successfully:', message.toJSON());

        // Emit the message to all clients in the room
        const io = getIO();
        if (io) {
            io.to(roomId).emit('receive_message', {
                ...message.toJSON(),
                timestamp: new Date()
            });
        } else {
            console.warn('Socket.IO instance not available');
        }

        res.status(201).json(message);
    } catch (error) {
        console.error('Error in sendMessage:', {
            error: error.message,
            stack: error.stack,
            name: error.name,
            errors: error.errors
        });
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ 
                message: 'Validation error',
                details: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }

        res.status(500).json({ 
            message: 'Internal server error',
            details: error.message
        });
    }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
    try {
        const { roomId } = req.body;
        const userId = req.user.userId; // Changed from req.user.id to req.user.userId
        
        await ChatMessage.update(
            { isRead: true },
            {
                where: {
                    roomId,
                    receiverId: userId,
                    isRead: false
                }
            }
        );

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error in markAsRead:', error);
        res.status(500).json({ message: error.message });
    }
};