import jwt from "jsonwebtoken";
export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Bạn cần đăng nhập để truy cập" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Giải mã thông tin user gán vào request
        next();
    } catch (error) {
        console.error("Lỗi xác thực token:", error.message);
        return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
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
