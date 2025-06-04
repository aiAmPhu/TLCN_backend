import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.REACT_APP_API_BASE_URL}/api/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Kiểm tra xem user đã tồn tại chưa
                let user = await User.findOne({ where: { email: profile.emails[0].value } });

                if (!user) {
                    // Nếu chưa tồn tại, tạo user mới
                    const lastUser = await User.findOne({ order: [['userId', 'DESC']] });
                    const newUserId = lastUser ? lastUser.userId + 1 : 1;
                    
                    // Tạo mật khẩu ngẫu nhiên
                    const randomPassword = Math.random().toString(36).slice(-8);
                    const hashedPassword = await bcrypt.hash(randomPassword, 10);

                    user = await User.create({
                        userId: newUserId,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        password: hashedPassword,
                        role: 'user', // Mặc định role là user
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.userId);
});

passport.deserializeUser(async (userId, done) => {
    try {
        const user = await User.findByPk(userId);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport; 