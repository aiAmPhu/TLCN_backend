import AdmissionQuantity from "../models/admissionQuantity.js";
import AdmissionMajor from "../models/admissionMajor.js";
import AdmissionCriteria from "../models/admissionCriteria.js";
import * as admissionQuantityService from "../services/admissionQuantityService.js";

export const addAdQuantity = async (req, res) => {
    try {
        const message = await admissionQuantityService.addAdQuantity(req.body);
        res.status(201).json({ message });
    } catch (error) {
        const status = error.statusCode || 500;
        const message = error.message || "Đã xảy ra lỗi khi thêm dữ liệu.";
        res.status(status).json({ message });
    }
};

export const getAllAdQuantities = async (req, res) => {
    try {
        const admissionQuantities = await admissionQuantityService.getAllAdQuantities();
        res.status(200).json(admissionQuantities);
    } catch (error) {
        const status = error.statusCode || 500;
        const message = error.message || "Đã xảy ra lỗi khi lấy danh sách tuyển sinh.";
        res.status(status).json({ message });
    }
};

export const updateAdQuantity = async (req, res) => {
    try {
        const result = await admissionQuantityService.updateAdQuantity(req.body);
        res.status(200).json(result);
    } catch (error) {
        const status = error.statusCode || 500;
        const message = error.message || "Đã xảy ra lỗi khi cập nhật dữ liệu.";
        res.status(status).json({ message });
    }
};

export const deleteAdQuantity = async (req, res) => {
    try {
        const result = await admissionQuantityService.deleteAdQuantity(req.body);
        res.status(200).json(result);
    } catch (error) {
        const status = error.statusCode || 500;
        const message = error.message || "Lỗi khi xóa dữ liệu.";
        res.status(status).json({ message });
    }
};
