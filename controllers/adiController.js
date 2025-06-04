import * as admissionInformationService from "../services/admissionInformationService.js";
import { createAdmissionNotification } from "./notificationController.js";

export const addAdInformation = async (req, res) => {
    try {
        const message = await admissionInformationService.addAdmissionInformation(req.body);
        res.status(201).json({ message });
    } catch (error) {
        console.error("Lỗi khi thêm thông tin tuyển sinh:", error.message);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || "Lỗi server không xác định.",
        });
    }
};

export const updateAdInformation = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const message = await admissionInformationService.updateAdmissionInformation(id, updateData);
        res.status(200).json({ message });
    } catch (error) {
        console.error("Lỗi khi cập nhật thông tin tuyển sinh:", error.message);
        res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi server khi cập nhật thông tin tuyển sinh.",
        });
    }
};

export const acceptAdInformation = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await admissionInformationService.acceptAdmissionInformation(id);
        // Send notification
        await createAdmissionNotification(id, 'accepted');
        res.status(200).json({ message });
    } catch (error) {
        console.error("Lỗi khi chấp nhận thông tin tuyển sinh:", error.message);
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi chấp nhận thông tin tuyển sinh.",
        });
    }
};

export const rejectAdInformation = async (req, res) => {
    try {
        const { id } = req.params;
        const { feedback } = req.body;
        const message = await admissionInformationService.rejectAdmissionInformation(id, feedback);
        // Send notification
        await createAdmissionNotification(id, 'rejected', feedback);
        res.status(200).json({ message });
    } catch (error) {
        console.error("Lỗi khi từ chối thông tin tuyển sinh:", error.message);
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi từ chối thông tin tuyển sinh.",
        });
    }
};

export const getAllAdInformation = async (req, res) => {
    try {
        const allInformation = await admissionInformationService.getAllAdmissionInformation();
        res.status(200).json(allInformation);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách thông tin tuyển sinh:", error.message);
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi lấy danh sách thông tin tuyển sinh.",
        });
    }
};

export const getAdmissionInformationByID = async (req, res) => {
    const { id } = req.params;
    try {
        const admissionInfo = await admissionInformationService.getAdmissionInformationById(id);
        res.status(200).json(admissionInfo);
    } catch (error) {
        console.error("Lỗi khi lấy thông tin tuyển sinh:", error.message);
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi lấy thông tin tuyển sinh.",
        });
    }
};

export const getBasicAdmissionInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await admissionInformationService.getBasicAdmissionInfo(id);
        res.status(200).json({ message: "Lấy thông tin thành công!", data });
    } catch (error) {
        console.error("Lỗi khi lấy thông tin cơ bản:", error.message);
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi truy vấn dữ liệu.",
        });
    }
};
