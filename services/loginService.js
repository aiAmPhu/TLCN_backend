import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { ApiError } from "../utils/ApiError.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const login = async (email, password) => {
    if (!email || !password) {
        throw new ApiError(400, "Email và mật khẩu là bắt buộc");
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new ApiError(404, "Người dùng không tồn tại");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Mật khẩu không chính xác");
    }
    const token = jwt.sign({ userId: user.userId, email: user.email, role: user.role, name: user.name }, JWT_SECRET, {
        expiresIn: "24h",
    });
    return {
        message: "Đăng nhập thành công",
        token,
        user: {
            userId: user.userId,
            email: user.email,
            name: user.name,
            role: user.role,
        },
    };
};

export const logout = (token, tokenBlacklist) => {
    if (!token) {
        throw new ApiError(401, "Không tìm thấy token");
    }
    try {
        jwt.verify(token, JWT_SECRET);
        tokenBlacklist.add(token);
        return { message: "Đăng xuất thành công" };
    } catch (err) {
        throw new ApiError(401, "Token không hợp lệ");
    }
};
