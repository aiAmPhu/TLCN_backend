import * as admissionRegionService from "../services/admissionRegionService.js";
export const addAdRegion = async (req, res) => {
    try {
        const message = await admissionRegionService.addAdRegion(req.body);
        res.status(201).json({ message });
    } catch (error) {
        const status = error.statusCode || 500;
        const message = error.message || "Lỗi khi thêm khu vực tuyển sinh.";
        res.status(status).json({ message });
    }
};

export const getAllAdRegions = async (req, res) => {
    try {
        const regions = await admissionRegionService.getAllAdRegions();
        res.status(200).json(regions);
    } catch (error) {
        const status = error.statusCode || 500;
        const message = error.message || "Đã xảy ra lỗi khi lấy danh sách khu vực tuyển sinh.";
        res.status(status).json({ message });
    }
};

export const updateAdRegion = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await admissionRegionService.updateAdRegion(id, req.body);
        res.status(200).json(result);
    } catch (error) {
        const status = error.statusCode || 500;
        const message = error.message || "Đã xảy ra lỗi khi cập nhật khu vực tuyển sinh.";
        res.status(status).json({ message });
    }
};

export const deleteAdRegion = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await admissionRegionService.deleteAdRegion(id);
        res.status(200).json(result);
    } catch (error) {
        const status = error.statusCode || 500;
        const message = error.message || "Đã xảy ra lỗi khi xóa vùng tuyển sinh.";
        res.status(status).json({ message });
    }
};
