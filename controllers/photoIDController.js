import * as photoIDService from "../services/photoIDService.js";

export const addPhotoID = async (req, res) => {
    try {
        const result = await photoIDService.addPhotoID(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi thêm ảnh",
        });
    }
};

export const acceptPhotoID = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await photoIDService.acceptPhotoID(userId);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi hệ thống, vui lòng thử lại sau!",
        });
    }
};

export const rejectPhotoID = async (req, res) => {
    try {
        const { userId } = req.params;
        const { feedback } = req.body;
        const result = await photoIDService.rejectPhotoID(userId, feedback);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi hệ thống, vui lòng thử lại sau!",
        });
    }
};

export const updatePhotoID = async (req, res) => {
    try {
        const { userId } = req.params;
        const updatedData = req.body;
        const result = await photoIDService.updatePhotoID(userId, updatedData);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi hệ thống, vui lòng thử lại sau!",
        });
    }
};

export const getAllPhotos = async (req, res) => {
    try {
        const photos = await photoIDService.getAllPhotos();
        res.json({ message: "Lấy danh sách ảnh hồ sơ thành công!", data: photos });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi hệ thống, vui lòng thử lại sau!",
        });
    }
};

export const getPhotoByUID = async (req, res) => {
    try {
        const { userId } = req.params;
        const photo = await photoIDService.getPhotoByUID(userId);
        res.json({ message: "Lấy ảnh hồ sơ thành công!", data: photo });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Lỗi hệ thống, vui lòng thử lại sau!" });
    }
};
