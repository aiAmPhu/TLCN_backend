import * as admissionMajorService from "../services/admissionMajorService.js";

export const addAdMajor = async (req, res) => {
    try {
        const message = await admissionMajorService.addAdMajor(req.body);
        res.status(201).json({ message });
    } catch (error) {
        console.error("Lỗi trong quá trình thêm chuyên ngành:", error);
        res.status(error.statusCode || 500).json({ message: error.message || "Lỗi server" });
    }
};

export const getAllAdMajors = async (req, res) => {
    try {
        const majors = await admissionMajorService.getAllAdMajors();
        res.status(200).json(majors);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách ngành tuyển sinh:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi lấy danh sách ngành tuyển sinh.",
        });
    }
};

export const getMajorByID = async (req, res) => {
    try {
        const { id } = req.params;
        const major = await admissionMajorService.getMajorByID(id);
        res.status(200).json(major);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Đã xảy ra lỗi khi lấy thông tin ngành tuyển sinh.";
        console.error("Lỗi khi lấy thông tin ngành tuyển sinh:", error);
        res.status(statusCode).json({ message });
    }
};

export const getMajorCombinationByID = async (req, res) => {
    try {
        const { id } = req.params;
        const majorCombination = await admissionMajorService.getMajorCombinationByID(id);
        res.status(200).json({ majorCombination });
    } catch (error) {
        const status = error.statusCode || 500;
        const message = error.message || "Đã xảy ra lỗi khi lấy tổ hợp xét tuyển.";
        console.error("Lỗi khi lấy tổ hợp ngành xét tuyển:", error);
        res.status(status).json({ message });
    }
};

export const updateAdMajor = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await admissionMajorService.updateAdMajor(id, req.body);
        res.status(200).json({ message });
    } catch (error) {
        const status = error.statusCode || 500;
        const message = error.message || "Đã xảy ra lỗi khi cập nhật ngành tuyển sinh.";
        res.status(status).json({ message });
    }
};

export const deleteAdMajor = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await admissionMajorService.deleteAdMajor(id);
        res.status(200).json({ message });
    } catch (error) {
        const status = error.statusCode || 500;
        const message = error.message || "Đã xảy ra lỗi khi xóa ngành tuyển sinh.";
        res.status(status).json({ message });
    }
};
