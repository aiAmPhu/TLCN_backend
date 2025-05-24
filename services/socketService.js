import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;
const onlineUsers = new Map();

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
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

        // Join a chat room
        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.user.userId} joined room: ${roomId}`);
        });

        // Leave a chat room
        socket.on('leave_room', (roomId) => {
            socket.leave(roomId);
            console.log(`User ${socket.user.userId} left room: ${roomId}`);
        });

        // Handle new messages
        socket.on('send_message', (data) => {
            // Verify user is part of the room
            if (data.senderId !== socket.user.userId) {
                console.error('Unauthorized message attempt:', {
                    senderId: data.senderId,
                    userId: socket.user.userId
                });
                return socket.emit('error', { message: 'Unauthorized' });
            }

            // Emit to room with sent status
            io.to(data.roomId).emit('receive_message', {
                ...data,
                status: 'sent',
                timestamp: new Date()
            });

            // Emit delivered status to sender
            socket.emit('message_status', {
                messageId: data.id,
                status: 'delivered'
            });
        });

        // Handle message read status
        socket.on('mark_as_read', (data) => {
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
            io.emit('user_status_change', {
                userId: socket.user.userId,
                status: 'offline'
            });
        });
    });

    return io;
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