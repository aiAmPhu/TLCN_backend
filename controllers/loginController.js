import User from "../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const loginFunction = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });
    }
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Mật khẩu không chính xác" });
        }
        const token = jwt.sign({ userId: user.userId, email: user.email, role: user.role }, JWT_SECRET, {
            expiresIn: "3h",
        });
        return res.status(200).json({
            message: "Đăng nhập thành công",
            token,
            user: {
                userId: user.userId,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        return res.status(500).json({ message: "Lỗi hệ thống. Vui lòng thử lại sau." });
    }
};
export const protectedFunction = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Lấy token từ headers

        if (!token) {
            return res.status(403).json({ message: "No token provided" });
        }

        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            res.json({ message: "Access granted", user: decoded });
        } catch (err) {
            res.status(401).json({ message: "Invalid token" });
        }
    } catch (error) {
        console.error("Error:", error); // Log chi tiết lỗi
        res.status(500).json({ message: error.message });
    }
};
