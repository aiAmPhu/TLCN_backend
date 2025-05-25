import AdmissionRegion from "../models/admissionRegion.js";
import AdmissionObject from "../models/admissionObject.js";
import LearningProcess from "../models/learningProcess.js";
import { Sequelize } from "sequelize";
import { ApiError } from "../utils/ApiError.js";

export const addLearningProcess = async (data) => {
    const { userId } = data;
    const existingProcess = await LearningProcess.findOne({ where: { userId } });
    if (existingProcess) {
        throw new ApiError(400, "User đã có quá trình học tập!");
    }
    try {
        await LearningProcess.create({
            ...data,
            status: data.status || "waiting",
        });
        return { message: "Thêm quá trình học tập thành công!" };
    } catch (error) {
        if (error.name === "SequelizeForeignKeyConstraintError") {
            throw new ApiError(422, "Dữ liệu không hợp lệ: liên kết khóa ngoại không tồn tại.");
        }
        throw new ApiError(500, "Đã xảy ra lỗi khi thêm quá trình học tập.");
    }
};

export const updateLearningProcess = async (userId, updateData) => {
    const existingProcess = await LearningProcess.findOne({ where: { userId } });
    if (!existingProcess) {
        throw new ApiError(404, "Không tìm thấy quá trình học tập của user này!");
    }
    updateData.status = "waiting";
    updateData.feedback = "";
    await LearningProcess.update(updateData, { where: { userId } });
    return { message: "Cập nhật quá trình học tập thành công!" };
};

export const acceptLearningProcess = async (userId) => {
    const existingProcess = await LearningProcess.findOne({ where: { userId } });
    if (!existingProcess) {
        throw new ApiError(404, "Không tìm thấy quá trình học tập của user này!");
    }
    await LearningProcess.update({ status: "accepted" }, { where: { userId } });
    return { message: "Đã duyệt quá trình học tập thành công!" };
};

export const rejectLearningProcess = async (userId, feedback) => {
    const existingProcess = await LearningProcess.findOne({ where: { userId } });
    if (!existingProcess) {
        throw new ApiError(404, "Không tìm thấy quá trình học tập của user này!");
    }
    await LearningProcess.update({ status: "rejected", feedback }, { where: { userId } });
    return { message: "Đã từ chối quá trình học tập thành công!" };
};

export const getAllLearningProcess = async () => {
    const allProcesses = await LearningProcess.findAll();
    if (!allProcesses || allProcesses.length === 0) {
        throw new ApiError(404, "Không có dữ liệu quá trình học tập nào.");
    }
    return allProcesses;
};

export const getLearningProcessByUID = async (userId) => {
    if (!userId) {
        throw new ApiError(400, "Thiếu userId trong yêu cầu.");
    }
    const learningProcess = await LearningProcess.findOne({
        where: { userId },
        include: [
            {
                model: AdmissionObject,
                attributes: ["objectName"],
            },
            {
                model: AdmissionRegion,
                attributes: ["regionName"],
            },
        ],
    });
    if (!learningProcess) {
        throw new ApiError(404, "Không tìm thấy dữ liệu cho userId này.");
    }
    const jsonData = learningProcess.toJSON();
    jsonData.priorityGroup = jsonData.admission_object?.objectName || jsonData.priorityGroup;
    jsonData.region = jsonData.AdmissionRegion?.regionName || jsonData.region;
    delete jsonData.admission_object;
    delete jsonData.AdmissionRegion;
    return jsonData;
};
