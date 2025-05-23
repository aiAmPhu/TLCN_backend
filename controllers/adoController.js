import * as admissionObjectService from "../services/admissionObjectService.js";

export const addAdObject = async (req, res) => {
    try {
        const message = await admissionObjectService.addAdObject(req.body);
        res.status(201).json({ message });
    } catch (error) {
        const status = error.statusCode || 500;
        const message = error.message || "Đã xảy ra lỗi khi thêm đối tượng ưu tiên.";
        res.status(status).json({ message });
    }
};

export const getAllAdObjects = async (req, res) => {
    try {
        const objects = await admissionObjectService.getAllAdObjects();
        res.status(200).json(objects);
    } catch (error) {
        const status = error.statusCode || 500;
        const message = error.message || "Đã xảy ra lỗi khi lấy danh sách đối tượng ưu tiên.";
        res.status(status).json({ message });
    }
};

export const updateAdObject = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await admissionObjectService.updateAdObject(id, req.body);
        res.status(200).json({ message });
    } catch (error) {
        const status = error.statusCode || 500;
        const message = error.message || "Đã xảy ra lỗi khi cập nhật đối tượng tuyển sinh.";
        res.status(status).json({ message });
    }
};

export const deleteAdObject = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await admissionObjectService.deleteAdObject(id);
        res.status(200).json({ message });
    } catch (error) {
        const status = error.statusCode || 500;
        const message = error.message || "Đã xảy ra lỗi khi xóa đối tượng tuyển sinh.";
        res.status(status).json({ message });
    }
};
