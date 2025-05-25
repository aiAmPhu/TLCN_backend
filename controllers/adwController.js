import AdmissionWishes from "../models/admissionWishes.js";
import Transcripts from "../models/Transcript.js";
import Scores from "../models/Score.js";
import AdmissionBlocks from "../models/admissionBlock.js";
import Subjects from "../models/Subject.js";
import AdmissionRegions from "../models/admissionRegion.js";
import AdmissionObjects from "../models/admissionObject.js";
import LearningProcess from "../models/learningProcess.js";
import AdmissionQuantity from "../models/admissionQuantity.js";
import { Op } from "sequelize";

import * as admissionWishService from "../services/admissionWishService.js";

export const addAdmissionWish = async (req, res) => {
    try {
        const result = await admissionWishService.addAdmissionWish(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error("Lỗi khi thêm nguyện vọng:", error);
        res.status(error.statusCode || 500).json({ message: error.message || "Đã xảy ra lỗi không xác định." });
    }
};

export const getAllWishesByUID = async (req, res) => {
    try {
        const wishes = await admissionWishService.getAcceptedWishes();
        res.status(200).json(wishes);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách nguyện vọng đã được chấp nhận:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi lấy danh sách nguyện vọng đã được chấp nhận.",
        });
    }
};

// export const getAllUniqueEmails = async (req, res) => {
//     try {
//         // Sử dụng phương thức distinct để lấy tất cả các email khác nhau
//         const emails = await AdmissionWish.distinct("email");

//         if (emails.length === 0) {
//             return res.status(400).json({ message: "No emails found" });
//         }

//         // Trả về danh sách các email duy nhất
//         res.status(200).json({ message: "All unique emails found", data: emails });
//     } catch (error) {
//         console.error("Error fetching unique emails:", error); // Log chi tiết lỗi
//         res.status(500).json({ message: error.message });
//     }
// };

export const getWishesByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const wishes = await AdmissionWishes.findAll({
            where: { status },
            attributes: ["wishId", "priority", "criteriaId", "admissionBlockId", "majorId", "uId", "scores", "status"],
        });
        if (wishes.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy nguyện vọng nào với trạng thái này." });
        }
        res.status(200).json({ wishes });
    } catch (error) {
        console.error("Lỗi khi lấy nguyện vọng theo trạng thái:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy nguyện vọng." });
    }
};

export const acceptWish = async (req, res) => {
    try {
        const { id } = req.params;
        const wish = await AdmissionWishes.findOne({ where: { wishId: id } });
        if (!wish) {
            return res.status(404).json({ message: "Không tìm thấy nguyện vọng với ID này." });
        }
        wish.status = "accepted";
        await wish.save();
        res.status(200).json({ message: "Nguyện vọng đã được chấp nhận." });
    } catch (error) {
        console.error("Lỗi khi chấp nhận nguyện vọng:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi chấp nhận nguyện vọng." });
    }
};

export const rejectWish = async (req, res) => {
    try {
        const { id } = req.params;
        const wish = await AdmissionWishes.findOne({ where: { wishId: id } });
        if (!wish) {
            return res.status(404).json({ message: "Không tìm thấy nguyện vọng với ID này." });
        }
        wish.status = "rejected";
        await wish.save();
        res.status(200).json({ message: "Nguyện vọng đã bị từ chối." });
    } catch (error) {
        console.error("Lỗi khi chấp nhận nguyện vọng:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi từ chối nguyện vọng." });
    }
};

export const waitingtWish = async (req, res) => {
    try {
        const { id } = req.params;
        const wish = await AdmissionWishes.findOne({ where: { wishId: id } });
        if (!wish) {
            return res.status(404).json({ message: "Không tìm thấy nguyện vọng với ID này." });
        }
        wish.status = "waiting";
        await wish.save();
        res.status(200).json({ message: "Nguyện vọng đã được đưa về trạng thái chờ." });
    } catch (error) {
        console.error("Lỗi khi chấp nhận nguyện vọng:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi điều chỉnh nguyện vọng." });
    }
};

export const getAcceptedWish = async (req, res) => {
    try {
        const acceptedWishes = await AdmissionWishes.findAll({
            where: { status: "accepted" },
            attributes: ["wishId", "priority", "criteriaId", "admissionBlockId", "majorId", "uId", "scores", "status"],
        });
        if (acceptedWishes.length === 0) {
            return res.status(404).json({ message: "Không có nguyện vọng nào được chấp nhận." });
        }
        res.status(200).json(acceptedWishes);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách nguyện vọng đã được chấp nhận:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi lấy danh sách nguyện vọng đã được chấp nhận.",
        });
    }
};

export const filterAdmissionResults = async (req, res) => {
    try {
        const result = await admissionWishService.filterAdmissionResults();
        res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi lọc kết quả tuyển sinh:", error);
        res.status(error.statusCode || 500).json({ message: error.message || "Đã xảy ra lỗi trong quá trình lọc." });
    }
};

export const resetAllWishesStatus = async (req, res) => {
    try {
        const result = await admissionWishService.resetAllWishesStatus();
        res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        res.status(500).json({
            message: "Đã xảy ra lỗi khi đặt lại trạng thái nguyện vọng.",
        });
    }
};
