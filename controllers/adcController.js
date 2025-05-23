import * as admissionCriteriaService from "../services/admissionCriteriaService.js";

export const addAdCriteria = async (req, res) => {
    try {
        const message = await admissionCriteriaService.addAdCriteria(req.body);
        res.status(201).json({ message });
    } catch (error) {
        console.error("Lỗi khi thêm tiêu chí xét tuyển:", error.message);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || "Lỗi server khi thêm tiêu chí xét tuyển.",
        });
    }
};

export const getAllAdCriterias = async (req, res) => {
    try {
        const adCriterias = await admissionCriteriaService.getAllAdmissionCriterias();
        res.status(200).json(adCriterias);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách chỉ tiêu:", error.message);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ message: error.message || "Lỗi phát sinh trong quá trình lấy dữ liệu" });
    }
};

export const updateAdCriteria = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await admissionCriteriaService.updateAdmissionCriteria(id, req.body);
        res.status(200).json({ message });
    } catch (error) {
        console.error("Lỗi khi cập nhật tiêu chí xét tuyển:", error.message);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || "Lỗi server khi cập nhật tiêu chí xét tuyển.",
        });
    }
};

export const deleteAdCriteria = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await admissionCriteriaService.deleteAdmissionCriteria(id);
        res.status(200).json({ message });
    } catch (error) {
        console.error("Lỗi khi xóa tiêu chí xét tuyển:", error.message);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || "Lỗi server khi xóa tiêu chí xét tuyển.",
        });
    }
};
