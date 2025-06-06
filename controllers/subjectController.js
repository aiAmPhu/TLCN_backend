import Subject from "../models/Subject.js";

// Lấy tất cả các môn học
export const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.findAll({
            attributes: ["suId", "subject"],
            order: [["suId", "ASC"]]
        });
        
        res.status(200).json({
            success: true,
            message: "Lấy danh sách môn học thành công",
            data: subjects
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách môn học:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách môn học",
            error: error.message
        });
    }
};

// Lấy môn học theo ID
export const getSubjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const subject = await Subject.findByPk(id);
        
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy môn học"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Lấy thông tin môn học thành công",
            data: subject
        });
    } catch (error) {
        console.error("Lỗi khi lấy thông tin môn học:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy thông tin môn học",
            error: error.message
        });
    }
};