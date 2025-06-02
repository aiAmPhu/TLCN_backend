import * as admissionYearService from "../services/admissionYearService.js";
// Tạo năm tuyển sinh mới
export const createAdmissionYear = async (req, res) => {
    try {
        const year = await admissionYearService.createAdmissionYear(req.body);
        res.status(201).json({
            message: "Tạo năm tuyển sinh thành công",
            data: year,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi khi tạo năm tuyển sinh",
        });
    }
};
// Lấy toàn bộ thông tin năm tuyển sinh
export const getAllAdmissionYears = async (req, res) => {
    try {
        const years = await admissionYearService.getAllAdmissionYears();
        res.status(200).json({
            message: "Lấy danh sách năm tuyển sinh thành công",
            data: years,
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy danh sách năm tuyển sinh",
        });
    }
};
// Kích hoạt năm tuyển sinh
export const activateAdmissionYear = async (req, res) => {
    try {
        const { yearId } = req.params;
        const result = await admissionYearService.activateAdmissionYear(yearId);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi khi kích hoạt năm tuyển sinh",
        });
    }
};
// Tuỳ chỉnh năm tuyển sinh
export const configureAdmissionYear = async (req, res) => {
    try {
        const { yearId } = req.params;
        const configData = req.body;
        console.log("Controller received - Year ID:", yearId);
        console.log("Controller received - Config data:", JSON.stringify(configData, null, 2));
        // Kiểm tra quyền chỉnh sửa
        const canEdit = await admissionYearService.canEditConfig(yearId);
        if (!canEdit) {
            return res.status(403).json({
                message: "Chỉ có thể cấu hình năm tuyển sinh đang hoạt động",
            });
        }
        const result = await admissionYearService.configureAdmissionYear(yearId, configData);
        res.status(200).json({
            message: "Cấu hình năm tuyển sinh thành công",
            data: result,
        });
    } catch (error) {
        console.error("Controller error:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi khi cấu hình năm tuyển sinh",
        });
    }
};
// Lấy cấu hình năm tuyển sinh
export const getAdmissionYearConfig = async (req, res) => {
    try {
        const { yearId } = req.params;
        console.log("Getting config for year:", yearId);

        const config = await admissionYearService.getAdmissionYearConfig(yearId);

        res.status(200).json({
            message: "Lấy cấu hình thành công",
            data: config,
        });
    } catch (error) {
        console.error("Get config error:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi khi lấy cấu hình",
        });
    }
};
// Lấy mục xét tuyển
export const getActiveYearOptions = async (req, res) => {
    try {
        const options = await admissionYearService.getActiveYearOptions();
        res.status(200).json({
            message: "Lấy options thành công",
            data: options,
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy options",
        });
    }
};
// So sánh năm tuyển sinh
export const compareYears = async (req, res) => {
    try {
        const { yearIds } = req.query;
        const comparison = await admissionYearService.compareYears(yearIds.split(","));
        res.status(200).json({
            message: "So sánh năm thành công",
            data: comparison,
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi so sánh năm",
        });
    }
};
// Thống kê theo năm học
export const getYearStatistics = async (req, res) => {
    try {
        const { yearId } = req.params;
        const stats = await admissionYearService.getYearStatistics(yearId);
        res.status(200).json({
            message: "Lấy thống kê thành công",
            data: stats,
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy thống kê",
        });
    }
};
