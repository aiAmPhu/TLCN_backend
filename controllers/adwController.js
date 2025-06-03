import * as admissionWishService from "../services/admissionWishService.js";
import AdmissionYear from "../models/admissionYear.js";
export const getAllYears = async (req, res) => {
    try {
        const years = await AdmissionYear.findAll({
            attributes: ["yearId", "yearName", "status"],
            order: [["yearName", "DESC"]],
        });

        res.status(200).json({
            message: "Lấy danh sách năm thành công",
            data: years,
        });
    } catch (error) {
        console.error("Error getting years:", error);
        res.status(500).json({
            message: "Lỗi khi lấy danh sách năm",
        });
    }
};
export const getWishFormData = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await admissionWishService.getActiveYearWishData(userId);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error getting wish form data:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi khi lấy dữ liệu nguyện vọng",
        });
    }
};

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

export const getFilteredAccepted = async (req, res) => {
    try {
        const { filterType, filterValue, limit } = req.query;
        console.log("Filter params:", { filterType, filterValue, limit });
        const wishes = await admissionWishService.getFilteredAcceptedWishes(
            filterType || "all",
            filterValue,
            limit ? parseInt(limit) : null
        );
        res.status(200).json({
            message: "Lấy danh sách trúng tuyển thành công",
            data: wishes,
            count: wishes.length,
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách trúng tuyển đã lọc:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi khi lấy danh sách trúng tuyển",
        });
    }
};

export const getFilterOptions = async (req, res) => {
    try {
        const [majors, criteria] = await Promise.all([
            admissionWishService.getMajorOptions(),
            admissionWishService.getCriteriaOptions(),
        ]);

        res.status(200).json({
            message: "Lấy options thành công",
            data: {
                majors,
                criteria,
            },
        });
    } catch (error) {
        console.error("Lỗi khi lấy options:", error);
        res.status(500).json({
            message: "Lỗi khi lấy options",
        });
    }
};
