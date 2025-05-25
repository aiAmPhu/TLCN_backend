import * as learningProcessService from "../services/learningProcessService.js";

export const addLearningProcess = async (req, res) => {
    try {
        const result = await learningProcessService.addLearningProcess(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi thêm quá trình học tập.",
        });
    }
};

export const updateLearningProcess = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;
        const result = await learningProcessService.updateLearningProcess(userId, updateData);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi cập nhật quá trình học tập.",
        });
    }
};

export const acceptLearningProcess = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await learningProcessService.acceptLearningProcess(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi duyệt quá trình học tập.",
        });
    }
};

export const rejectLearningProcess = async (req, res) => {
    try {
        const { userId } = req.params;
        const { feedback } = req.body;
        const result = await learningProcessService.rejectLearningProcess(userId, feedback);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi từ chối quá trình học tập.",
        });
    }
};

export const getAllLearningProcess = async (req, res) => {
    try {
        const allProcesses = await learningProcessService.getAllLearningProcess();
        res.status(200).json({ message: "Lấy danh sách thành công!", data: allProcesses });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi lấy dữ liệu quá trình học tập.",
        });
    }
};

export const getLearningProcessByUID = async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await learningProcessService.getLearningProcessByUID(userId);
        res.status(200).json({
            message: "Lấy dữ liệu thành công!",
            data,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi truy vấn dữ liệu.",
        });
    }
};
