import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { tokenBlacklist } from "../controllers/loginController.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Không tìm thấy token" });
    }
    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ message: "Token đã bị vô hiệu hóa" });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token đã hết hạn" });
        }
        return res.status(401).json({ message: "Token không hợp lệ" });
    }
};

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Bạn không có quyền truy cập chức năng này" });
        }
        next();
    };
};
