// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: "dlum0st9k", // tên Cloudinary
    api_key: "587847345264168", // API Key
    api_secret: "49U21eHC5eXgAtXJYYPgRT3ZtIA", // API Secret
});

export default cloudinary;
