import AdmissionInformation from "../models/admissionInfomation.js";
import PhotoID from "../models/photoID.js";
import Transcript from "../models/Transcript.js";
import LearningProcess from "../models/learningProcess.js";
import { ApiError } from "../utils/ApiError.js";
import { Sequelize } from "sequelize";

export const addAdmissionInformation = async (data) => {
    const { userId } = data;
    const existingInfo = await AdmissionInformation.findOne({ where: { userId } });
    if (existingInfo) {
        throw new ApiError(400, "Thông tin tuyển sinh của người dùng này đã tồn tại!");
    }
    try {
        await AdmissionInformation.create(data);
        return "Thêm thông tin tuyển sinh thành công!";
    } catch (error) {
        if (error instanceof Sequelize.ForeignKeyConstraintError) {
            throw new ApiError(422, "Dữ liệu không hợp lệ: liên kết khóa ngoại không tồn tại (userId không tồn tại).");
        }
        throw new ApiError(500, "Lỗi server khi thêm thông tin tuyển sinh.");
    }
};

export const updateAdmissionInformation = async (userId, updateData) => {
    const existingInfo = await AdmissionInformation.findOne({ where: { userId } });
    if (!existingInfo) {
        throw new ApiError(404, "Không tìm thấy thông tin tuyển sinh!");
    }
    if (updateData.status && !["waiting", "accepted", "rejected"].includes(updateData.status)) {
        throw new ApiError(400, "Trạng thái không hợp lệ!");
    }
    updateData.status = "waiting";
    updateData.feedback = "";
    await existingInfo.update(updateData);
    return "Cập nhật thông tin tuyển sinh thành công!";
};

export const acceptAdmissionInformation = async (userId) => {
    const existingInfo = await AdmissionInformation.findOne({ where: { userId } });
    if (!existingInfo) {
        throw new ApiError(404, "Thông tin tuyển sinh không tồn tại.");
    }
    await AdmissionInformation.update({ status: "accepted" }, { where: { userId } });
    return "Thông tin tuyển sinh đã được chấp nhận.";
};

export const rejectAdmissionInformation = async (userId, feedback) => {
    const existingInfo = await AdmissionInformation.findOne({ where: { userId } });
    if (!existingInfo) {
        throw new ApiError(404, "Thông tin tuyển sinh không tồn tại.");
    }
    await AdmissionInformation.update({ status: "rejected", feedback }, { where: { userId } });
    return "Thông tin tuyển sinh đã bị từ chối.";
};

export const getAllAdmissionInformation = async () => {
    const allInformation = await AdmissionInformation.findAll();
    if (!allInformation || allInformation.length === 0) {
        throw new ApiError(404, "Không có thông tin tuyển sinh nào.");
    }
    return allInformation;
};

export const getAdmissionInformationById = async (id) => {
    const admissionInfo = await AdmissionInformation.findOne({ where: { userId: id } });
    if (!admissionInfo) {
        throw new ApiError(404, "Không tìm thấy thông tin tuyển sinh.");
    }
    return admissionInfo;
};

export const getBasicAdmissionInfo = async (userId) => {
    if (!userId) {
        throw new ApiError(400, "Thiếu userId trong yêu cầu.");
    }
    const info = await AdmissionInformation.findOne({
        where: { userId },
        attributes: [
            "firstName",
            "lastName",
            "birthDate",
            "email",
            "gender",
            "phone",
            "idNumber",
            "status",
            "feedback",
        ],
        include: [
            {
                model: PhotoID,
                as: "Photo",
                attributes: ["personalPic", "status", "feedback"],
            },
        ],
    });
    if (!info) {
        throw new ApiError(404, "Không tìm thấy thông tin.");
    }
    const [transcript, learning] = await Promise.all([
        Transcript.findOne({ where: { userId }, attributes: ["status", "feedback"] }),
        LearningProcess.findOne({ where: { userId }, attributes: ["status", "feedback"] }),
    ]);
    const plain = info.toJSON();
    const parts = [
        { name: "Thông tin cá nhân", status: plain.status, feedback: plain.feedback },
        { name: "Ảnh", status: plain.Photo?.status, feedback: plain.Photo?.feedback },
        { name: "Học bạ", status: transcript?.status, feedback: transcript?.feedback },
        { name: "Quá trình học tập", status: learning?.status, feedback: learning?.feedback },
    ];
    const statusList = parts.map((p) => p.status);
    let unifiedStatus;
    if (statusList.every((s) => s === "accepted")) {
        unifiedStatus = "accepted";
    } else if (statusList.includes("rejected")) {
        unifiedStatus = "rejected";
    } else if (statusList.includes("waiting")) {
        unifiedStatus = "waiting";
    }
    const feedbackSummary =
        parts
            .filter((p) => p.status === "rejected" && typeof p.feedback === "string" && p.feedback.trim() !== "")
            .map((p) => `- ${p.name}: ${p.feedback.trim()}`)
            .join("\n") || null;
    return {
        fullName: `${plain.firstName} ${plain.lastName}` || "Chưa cập nhật",
        birthDate: plain.birthDate || "Chưa cập nhật",
        email: plain.email || "Chưa cập nhật",
        gender: plain.gender || "Chưa cập nhật",
        phoneNumber: plain.phone || "Chưa cập nhật",
        idNumber: plain.idNumber || "Chưa cập nhật",
        pic: plain.Photo?.personalPic || null,
        status: unifiedStatus,
        feedbackSummary: feedbackSummary || null,
    };
};
