import AdmissionRegion from "../models/admissionRegion.js";
import AdmissionObject from "../models/admissionObject.js";
import LearningProcess from "../models/learningProcess.js";
import { Sequelize } from "sequelize";

export const addLearningProcess = async (req, res) => {
    try {
        const {
            userId,
            grade10_province,
            grade10_district,
            grade10_school,
            grade11_province,
            grade11_district,
            grade11_school,
            grade12_province,
            grade12_district,
            grade12_school,
            graduationYear,
            priorityGroup,
            region,
            status,
            feedback,
        } = req.body;
        const existingProcess = await LearningProcess.findOne({ where: { userId } });
        if (existingProcess) {
            return res.status(400).json({ message: "User đã có quá trình học tập!" });
        }
        await LearningProcess.create({
            userId,
            grade10_province,
            grade10_district,
            grade10_school,
            grade11_province,
            grade11_district,
            grade11_school,
            grade12_province,
            grade12_district,
            grade12_school,
            graduationYear,
            priorityGroup,
            region,
            status: status || "waiting",
            feedback,
        });
        res.status(201).json({
            message: "Thêm quá trình học tập thành công!",
        });
    } catch (error) {
        if (error instanceof Sequelize.ForeignKeyConstraintError) {
            return res.status(422).json({
                message: "Dữ liệu không hợp lệ: liên kết khóa ngoại không tồn tại.",
            });
        }
        console.error("Lỗi khi thêm quá trình học tập:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi thêm quá trình học tập." });
    }
};

export const updateLearningProcess = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;
        updateData.status = "waiting";
        updateData.feedback = "";
        const existingProcess = await LearningProcess.findOne({ where: { userId } });
        if (!existingProcess) {
            return res.status(404).json({ message: "Không tìm thấy quá trình học tập của user này!" });
        }
        await LearningProcess.update(updateData, { where: { userId } });
        res.status(200).json({
            message: "Cập nhật quá trình học tập thành công!",
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật quá trình học tập:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật quá trình học tập." });
    }
};

export const deleteLearningProcess = async (req, res) => {
    const { userId } = req.params;
    try {
        const deletedCount = await LearningProcess.destroy({ where: { userId } });
        if (deletedCount === 0) {
            return res.status(404).json({ message: "Không tìm thấy quá trình học tập để xoá." });
        }
        res.status(200).json({ message: "Xoá quá trình học tập thành công." });
    } catch (error) {
        console.error("Lỗi khi xoá quá trình học tập:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi xoá", error: error.message });
    }
};

export const acceptLearningProcess = async (req, res) => {
    try {
        const { userId } = req.params;
        const existingProcess = await LearningProcess.findOne({ where: { userId } });
        if (!existingProcess) {
            return res.status(404).json({ message: "Không tìm thấy quá trình học tập của user này!" });
        }
        await LearningProcess.update({ status: "accepted" }, { where: { userId } });
        res.status(200).json({
            message: "Đã duyệt quá trình học tập thành công!",
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi duyệt quá trình học tập." });
    }
};

export const rejectLearningProcess = async (req, res) => {
    try {
        const { userId } = req.params;
        const { feedback } = req.body;
        const existingProcess = await LearningProcess.findOne({ where: { userId } });
        if (!existingProcess) {
            return res.status(404).json({ message: "Không tìm thấy quá trình học tập của user này!" });
        }
        await LearningProcess.update({ status: "rejected", feedback }, { where: { userId } });
        res.status(200).json({
            message: "Đã từ chối quá trình học tập thành công!",
        });
    } catch (error) {
        console.error("Lỗi khi từ chối quá trình học tập:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi từ chối quá trình học tập." });
    }
};

export const getAllLearningProcess = async (req, res) => {
    try {
        const allProcesses = await LearningProcess.findAll();
        if (!allProcesses || allProcesses.length === 0) {
            return res.status(404).json({ message: "Không có dữ liệu quá trình học tập nào." });
        }
        res.status(200).json({ message: "Lấy danh sách thành công!", data: allProcesses });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách quá trình học tập:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy dữ liệu quá trình học tập." });
    }
};

export const getPriorityGroupStatusByUID = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "Thiếu userId trong yêu cầu." });
        }
        const learningProcess = await LearningProcess.findOne({
            where: { userId },
            attributes: ["priorityGroup"],
        });
        if (!learningProcess) {
            return res.status(404).json({ message: "Không tìm thấy dữ liệu cho userId này." });
        }
        res.status(200).json({
            message: "Lấy dữ liệu thành công!",
            priorityGroup: learningProcess.priorityGroup,
        });
    } catch (error) {
        console.error("Lỗi khi lấy priorityGroup:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi truy vấn dữ liệu." });
    }
};

export const getLearningProcessStatusByUID = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "Thiếu userId trong yêu cầu." });
        }
        const learningProcess = await LearningProcess.findOne({
            where: { userId },
            attributes: ["status", "feedback"],
        });
        if (!learningProcess) {
            return res.status(404).json({ message: "Không tìm thấy dữ liệu cho userId này." });
        }
        res.status(200).json({
            message: "Lấy dữ liệu thành công!",
            data: learningProcess,
        });
    } catch (error) {
        console.error("Lỗi khi lấy status và feedback:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi truy vấn dữ liệu." });
    }
};

export const getLearningProcessByUID = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "Thiếu userId trong yêu cầu." });
        }
        const learningProcess = await LearningProcess.findOne({
            where: { userId },
            include: [
                {
                    model: AdmissionObject,
                    attributes: ["objectName"], // hoặc chỉ 'name' nếu không cần id
                },
                {
                    model: AdmissionRegion,
                    attributes: ["regionName"],
                },
            ],
        });
        if (!learningProcess) {
            return res.status(404).json({ message: "Không tìm thấy dữ liệu cho userId này." });
        }
        // Format dữ liệu trả về
        const jsonData = learningProcess.toJSON();
        // Gán lại priorityGroup và region thành name tương ứng
        jsonData.priorityGroup = jsonData.admission_object?.objectName || jsonData.priorityGroup;
        jsonData.region = jsonData.AdmissionRegion?.regionName || jsonData.region;
        // Xoá các trường không cần
        delete jsonData.admission_object;
        delete jsonData.AdmissionRegion;
        res.status(200).json({
            message: "Lấy dữ liệu thành công!",
            data: jsonData,
        });
    } catch (error) {
        console.error("Lỗi khi lấy thông tin quá trình học tập:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi truy vấn dữ liệu." });
    }
};
