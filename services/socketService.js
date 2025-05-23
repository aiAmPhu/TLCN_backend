import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

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

            io.to(data.roomId).emit('receive_message', {
                ...data,
                timestamp: new Date()
            });
        });

        // Handle typing status
        socket.on('typing', (data) => {
            socket.to(data.roomId).emit('user_typing', {
                userId: socket.user.userId,
                isTyping: data.isTyping
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id, 'User:', socket.user.userId);
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