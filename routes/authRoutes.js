import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Route để bắt đầu quá trình đăng nhập bằng Google
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback route sau khi xác thực Google
router.get('/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        // Tạo JWT token
        const token = jwt.sign(
            { 
                userId: req.user.userId,
                email: req.user.email,
                role: req.user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Redirect về frontend với token
        res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`);
    }
);

export default router; 