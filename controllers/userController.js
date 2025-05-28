import dotenv from "dotenv";
import * as userService from "../services/userService.js";
import * as admissionWishService from "../services/admissionWishService.js";
import User from "../models/user.js";
dotenv.config();
const otpStore = {};

export const addUser = async (req, res) => {
    try {
        const result = await userService.addUser(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error("Lỗi khi tạo người dùng:", error.message);
        res.status(error.statusCode || 500).json({ message: error.message || "Tạo người dùng thất bại" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({ message: "Lấy thông tin người dùng thành công", data: users });
    } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error.message);
        res.status(error.statusCode || 500).json({ message: error.message || "Lỗi trong quá trình lấy thông tin" });
    }
};

export const updateUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await userService.updateUser(userId, req.body);
        res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi khi cập nhật người dùng:", error.message);
        res.status(error.statusCode || 500).json({ message: error.message || "Cập nhật người dùng thất bại" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const { userId } = req.params;
        const result = await userService.changePassword(userId, oldPassword, newPassword);
        res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi khi đổi mật khẩu:", error.message);
        res.status(error.statusCode || 500).json({ message: error.message || "Đã xảy ra lỗi khi đổi mật khẩu" });
    }
};

export const deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await userService.deleteUser(userId);
        res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error.message);
        res.status(error.statusCode || 500).json({ message: error.message || "Xóa người dùng thất bại" });
    }
};

export const sendOTP = async (req, res) => {
    const { email } = req.body;
    try {
        const result = await userService.sendOTP(email, otpStore);
        res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi gửi OTP:", error);
        res.status(error.statusCode || 500).json({ message: error.message || "Gửi OTP thất bại!" });
    }
};

export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const result = await userService.verifyOTP(email, otp, otpStore);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Xác thực OTP thất bại!" });
    }
};

export const sendOTPForReset = async (req, res) => {
    const { email } = req.body;
    try {
        const result = await userService.sendOTPForReset(email, otpStore);
        res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi gửi OTP reset:", error);
        res.status(error.statusCode || 500).json({ message: error.message || "Gửi OTP thất bại!" });
    }
};

export const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const result = await userService.resetPassword(email, newPassword);
        res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi reset mật khẩu:", error.message);
        res.status(error.statusCode || 500).json({ message: error.message || "Reset mật khẩu thất bại" });
    }
};

export const getUsersForReviewer = async (req, res) => {
    try {
        const reviewerUserId = req.user.userId;
        // Lấy reviewer info để trả về majorGroup
        const reviewer = await User.findByPk(reviewerUserId);
        if (!reviewer) {
            return res.status(404).json({ message: "Reviewer không tồn tại" });
        }
        // Lấy users qua admissionWishService
        const users = await admissionWishService.getWishesByReviewerPermission(reviewerUserId);
        res.status(200).json({
            message: "Lấy danh sách người dùng thành công",
            data: {
                users: users,
                reviewerMajors: reviewer.majorGroup || [],
            },
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng cho reviewer:", error.message);
        res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi trong quá trình lấy thông tin",
        });
    }
};
