// routes/upload.js
import express from "express";
import upload from "../controllers/uploadImage.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/upload", authenticate, authorizeRoles("user", "admin"), upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Không có file nào được upload!" });
    }

    // Trả về URL của ảnh đã tải lên
    res.status(200).json({
        imageUrl: req.file.path, // Đường dẫn URL từ Cloudinary
    });
});

export default router;
