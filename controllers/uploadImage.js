// middleware/upload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Thiết lập lưu trữ với Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "tlcnFolder", // Tên thư mục trên Cloudinary
        allowed_formats: ["jpg", "jpeg", "png"], // Các định dạng ảnh cho phép
        transformation: [
            {
                crop: "limit", // Giới hạn kích thước tối đa nhưng giữ nguyên tỷ lệ
                quality: "auto", // Tự động điều chỉnh chất lượng
            },
        ],
    },
});

const upload = multer({ storage: storage });
export default upload;
