import express from "express";
import { loginFunction, logoutFunction } from "../controllers/loginController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginFunction);
router.post("/logout", authenticate, logoutFunction);
router.get("/verify", authenticate, (req, res) => {
    // Nếu vào được đây tức là token đã hợp lệ, không blacklist, chưa hết hạn
    return res.status(200).json({
        valid: true,
        message: "Token hợp lệ",
        user: req.user, // chứa userId, email, role từ token
    });
});

export default router;
