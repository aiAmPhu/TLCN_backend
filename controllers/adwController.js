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
        const { uId } = req.params;
        const wishes = await admissionWishService.getAllWishesByUID(uId);
        res.status(200).json({
            message: "Lấy danh sách nguyện vọng thành công.",
            wishes,
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách nguyện vọng", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi lấy danh sách nguyện vọng.",
        });
    }
};

export const getAcceptedWish = async (req, res) => {
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
