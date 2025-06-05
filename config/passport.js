import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.js';
import AdmissionInformation from '../models/admissionInfomation.js';
import LearningProcess from '../models/learningProcess.js';
import PhotoID from '../models/photoID.js';
import Transcript from '../models/Transcript.js';
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

                    // Tạo các bản ghi liên quan
                    await AdmissionInformation.create({
                        userId: user.userId,
                        email: user.email,
                    });

                    await LearningProcess.create({
                        userId: user.userId,
                    });

                    await PhotoID.create({
                        userId: user.userId,
                    });

                    const lastTranscript = await Transcript.findOne({
                        order: [["tId", "DESC"]],
                    });
                    const newTranscriptId = lastTranscript ? lastTranscript.tId + 1 : 1;
                    await Transcript.create({
                        userId: user.userId,
                        tId: newTranscriptId,
                    });
                } else {
                    // Nếu user đã tồn tại, kiểm tra và tạo các bản ghi liên quan nếu thiếu
                    const [adInfo, photo, learning, transcript] = await Promise.all([
                        AdmissionInformation.findOne({ where: { userId: user.userId } }),
                        PhotoID.findOne({ where: { userId: user.userId } }),
                        LearningProcess.findOne({ where: { userId: user.userId } }),
                        Transcript.findOne({ where: { userId: user.userId } }),
                    ]);
                    if (!adInfo) await AdmissionInformation.create({ userId: user.userId, email: user.email });
                    if (!photo) await PhotoID.create({ userId: user.userId });
                    if (!learning) await LearningProcess.create({ userId: user.userId });
                    if (!transcript) {
                        const lastTranscript = await Transcript.findOne({ order: [["tId", "DESC"]] });
                        const newTranscriptId = lastTranscript ? lastTranscript.tId + 1 : 1;
                        await Transcript.create({ userId: user.userId, tId: newTranscriptId });
                    }
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