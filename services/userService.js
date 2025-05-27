import User from "../models/user.js";
import AdmissionInformation from "../models/admissionInfomation.js";
import LearningProcess from "../models/learningProcess.js";
import PhotoID from "../models/photoID.js";
import Transcript from "../models/Transcript.js";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError.js";
import nodemailer from "nodemailer";

const isValidEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
};
const isValidPassword = (password) => {
    const regex = /^[A-Za-z0-9]{8,}$/;
    return regex.test(password);
};

export const addUser = async ({ name, email, password, role, pic }) => {
    if (!isValidEmail(email)) {
        throw new ApiError(400, "Email không hợp lệ");
    }
    if (!isValidPassword(password)) {
        throw new ApiError(400, "Mật khẩu phải ít nhất 8 ký tự và chỉ bao gồm chữ hoặc số");
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new ApiError(400, "Email đã được đăng ký");
    }
    const lastUser = await User.findOne({ order: [["userId", "DESC"]] });
    const newUserId = lastUser ? lastUser.userId + 1 : 1;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        userId: newUserId,
        name,
        email,
        password: hashedPassword,
        role,
        pic,
    });
    await AdmissionInformation.create({
        userId: newUser.userId,
        email: newUser.email,
    });
    await LearningProcess.create({
        userId: newUser.userId,
    });
    await PhotoID.create({
        userId: newUser.userId,
    });
    const lastTranscript = await Transcript.findOne({
        order: [["tId", "DESC"]],
    });
    const newTranscriptId = lastTranscript ? lastTranscript.tId + 1 : 1;
    await Transcript.create({
        userId: newUser.userId,
        tId: newTranscriptId,
    });
    return { message: "Tạo người dùng thành công", user: newUser };
};

export const getAllUsers = async () => {
    const users = await User.findAll();
    if (!users || users.length === 0) {
        throw new ApiError(404, "Không có người dùng nào!");
    }
    return users;
};

export const updateUser = async (userId, { name, email, password, role, pic }) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new ApiError(404, "Không tìm thấy người dùng");
    }
    if (email && !isValidEmail(email)) {
        throw new ApiError(400, "Email không hợp lệ");
    }
    if (password && !isValidPassword(password)) {
        throw new ApiError(400, "Mật khẩu phải có ít nhất 8 ký tự, chỉ gồm chữ cái và số");
    }
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (pic !== undefined) user.pic = pic;
    if (password !== undefined) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
    }
    await user.save();
    return { message: "Cập nhật người dùng thành công" };
};

export const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await User.findOne({ where: { userId } });
    if (!user) {
        throw new ApiError(404, "Người dùng không tồn tại");
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new ApiError(400, "Mật khẩu cũ không chính xác");
    }
    if (!isValidPassword(newPassword)) {
        throw new ApiError(400, "Mật khẩu phải có ít nhất 8 ký tự, chỉ gồm chữ cái và số");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return { message: "Đổi mật khẩu thành công" };
};

export const deleteUser = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new ApiError(404, "Không tìm thấy người dùng");
    }
    await user.destroy();
    return { message: "Xóa người dùng thành công" };
};

export const sendOTP = async (email, otpStore) => {
    if (!email) throw new ApiError(400, "Email is required");
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email)) throw new ApiError(400, "Email không hợp lệ");

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) throw new ApiError(400, "Email đã được đăng ký!");

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;
    setTimeout(() => {
        delete otpStore[email];
    }, 5 * 60 * 1000); // 5 phút

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "bophantuyensinhute@gmail.com",
            pass: process.env.NODE_MAIL_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: "Bộ phận tuyển sinh UTE",
        to: email,
        subject: "Mã xác nhận OTP",
        text: `Mã OTP của bạn là: ${otp}. Mã sẽ hết hạn sau 5 phút.`,
    });

    return { message: "Đã gửi OTP tới email!" };
};

export const verifyOTP = async (email, otp, otpStore) => {
    if (!email || !otp) throw new ApiError(400, "Thiếu email hoặc OTP");
    const validOTP = otpStore[email];
    if (typeof validOTP === "undefined") {
        throw new ApiError(400, "OTP đã hết hạn hoặc không tồn tại");
    }
    if (parseInt(otp) !== validOTP) {
        throw new ApiError(400, "OTP không đúng");
    }
    delete otpStore[email];
    return { message: "Xác thực thành công!" };
};

export const sendOTPForReset = async (email, otpStore) => {
    if (!email) throw new ApiError(400, "Email is required");
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email)) throw new ApiError(400, "Email không hợp lệ");
    // Kiểm tra email có tồn tại trong database không
    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) throw new ApiError(404, "Email không tồn tại trong hệ thống!");
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;
    setTimeout(() => {
        delete otpStore[email];
    }, 5 * 60 * 1000); // 5 phút
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "bophantuyensinhute@gmail.com",
            pass: process.env.NODE_MAIL_PASSWORD,
        },
    });
    await transporter.sendMail({
        from: "Bộ phận tuyển sinh UTE",
        to: email,
        subject: "Mã xác nhận OTP - Quên mật khẩu",
        text: `Mã OTP để đặt lại mật khẩu của bạn là: ${otp}. Mã sẽ hết hạn sau 5 phút.`,
    });
    return { message: "Đã gửi OTP tới email!" };
};

export const resetPassword = async (email, newPassword) => {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new ApiError(404, "Không tìm thấy người dùng");
    }
    if (!isValidPassword(newPassword)) {
        throw new ApiError(400, "Mật khẩu phải có ít nhất 8 ký tự, chỉ gồm chữ cái và số");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return { message: "Đổi mật khẩu thành công" };
};
