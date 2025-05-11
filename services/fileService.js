import multer from "multer"
import cloudinary from "../config/cloudinary.js"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import chatbotConfig from "../config/chatbotConfig.js"

class FileService {
  constructor() {
    this.config = chatbotConfig.fileUpload

    // Configure Cloudinary storage
    this.storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: "chatbot_attachments",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "pdf"],
        transformation: [
          {
            quality: "auto",
          },
        ],
      },
    })

    // Configure multer for file uploads
    this.upload = multer({
      storage: this.storage,
      limits: {
        fileSize: this.config.maxFileSize,
      },
      fileFilter: (req, file, cb) => {
        if (this.config.allowedTypes.includes(file.mimetype)) {
          cb(null, true)
        } else {
          cb(new Error("Invalid file type. Only images and PDFs are allowed."), false)
        }
      },
    })
  }

  /**
   * Get multer middleware for file uploads
   * @returns {Function} - Multer middleware
   */
  getUploadMiddleware() {
    return this.upload.single("attachment")
  }

  /**
   * Process file upload result
   * @param {Object} file - The uploaded file object from multer
   * @returns {Object} - File information
   */
  processUploadedFile(file) {
    if (!file) {
      return null
    }

    return {
      url: file.path,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    }
  }
}

export default new FileService()
