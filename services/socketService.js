import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import ChatMessage from '../models/chatMessage.js';
import { Op } from 'sequelize';

let io;
const onlineUsers = new Map();
const userRooms = new Map();

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Cho phép tất cả các origin trong môi trường development
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true,
            allowedHeaders: ["Content-Type", "Authorization"]
        },
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000,
        connectTimeout: 45000,
        allowEIO3: true
    });

    // Middleware for authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            console.error('Socket authentication error:', err);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id, 'User:', socket.user.userId);
        
        // Add user to online users
        onlineUsers.set(socket.user.userId, socket.id);
        io.emit('user_status_change', {
            userId: socket.user.userId,
            status: 'online'
        });

        // Join user's personal room for notifications
        const userRoom = `user_${socket.user.userId}`;
        socket.join(userRoom);
        userRooms.set(socket.user.userId, userRoom);

        // Join a chat room
        socket.on('join_room', async (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.user.userId} joined room: ${roomId}`);
            
            // Reset unread count when joining room
            await ChatMessage.update(
                { unreadCount: 0 },
                {
                    where: {
                        roomId,
                        receiverId: socket.user.userId,
                        status: { [Op.ne]: 'read' }
                    }
                }
            );
        });

        // Leave a chat room
        socket.on('leave_room', (roomId) => {
            socket.leave(roomId);
            console.log(`User ${socket.user.userId} left room: ${roomId}`);
        });

        // Handle new messages
        socket.on('send_message', async (data) => {
            // Verify user is part of the room
            if (data.senderId !== socket.user.userId) {
                console.error('Unauthorized message attempt:', {
                    senderId: data.senderId,
                    userId: socket.user.userId
                });
                return socket.emit('error', { message: 'Unauthorized' });
            }

            // Increment unread count for receiver
            await ChatMessage.increment('unreadCount', {
                where: {
                    roomId: data.roomId,
                    receiverId: data.receiverId
                }
            });

            // Emit to room with sent status
            io.to(data.roomId).emit('receive_message', {
                ...data,
                status: 'sent',
                timestamp: new Date()
            });

            // Emit to receiver's personal room if they're not in the chat room
            const receiverRoom = userRooms.get(data.receiverId);
            if (receiverRoom) {
                io.to(receiverRoom).emit('new_message_notification', {
                    roomId: data.roomId,
                    senderId: data.senderId,
                    content: data.content,
                    unreadCount: await getUnreadCount(data.receiverId)
                });
            }

            // Emit delivered status to sender
            socket.emit('message_status', {
                messageId: data.id,
                status: 'delivered'
            });
        });

        // Handle message read status
        socket.on('mark_as_read', async (data) => {
            await ChatMessage.update(
                { status: 'read', unreadCount: 0 },
                {
                    where: {
                        roomId: data.roomId,
                        receiverId: socket.user.userId
                    }
                }
            );

            io.to(data.roomId).emit('message_status', {
                messageId: data.messageId,
                status: 'read'
            });
        });

        // Handle message reactions
        socket.on('add_reaction', (data) => {
            io.to(data.roomId).emit('message_reaction', {
                messageId: data.messageId,
                reaction: data.reaction,
                userId: socket.user.userId
            });
        });

        // Handle typing status
        socket.on('typing', (data) => {
            socket.to(data.roomId).emit('user_typing', {
                userId: socket.user.userId,
                isTyping: data.isTyping
            });
        });

        // Handle message deletion
        socket.on('delete_message', (data) => {
            io.to(data.roomId).emit('message_deleted', {
                messageId: data.messageId
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id, 'User:', socket.user.userId);
            onlineUsers.delete(socket.user.userId);
            userRooms.delete(socket.user.userId);
            io.emit('user_status_change', {
                userId: socket.user.userId,
                status: 'offline'
            });
        });
    });

    return io;
};

// Helper function to get unread count
const getUnreadCount = async (userId) => {
    const result = await ChatMessage.sum('unreadCount', {
        where: {
            receiverId: userId,
            status: { [Op.ne]: 'read' }
        }
    });
    return result || 0;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

export const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
};