import AdmissionInformation from "../models/admissionInfomation.js";
import PhotoID from "../models/photoID.js";
import Transcript from "../models/Transcript.js";
import LearningProcess from "../models/learningProcess.js";
import { Sequelize } from "sequelize";

export const addAdInformation = async (req, res) => {
    try {
        const {
            userId,
            firstName,
            lastName,
            birthDate,
            gender,
            birthPlace,
            phone,
            email,
            parentEmail,
            idNumber,
            idIssueDate,
            idIssuePlace,
            province,
            district,
            commune,
            address,
            houseNumber,
            streetName,
            status,
            feedback,
        } = req.body;
        const existingInfo = await AdmissionInformation.findOne({ where: { userId } });
        if (existingInfo) {
            return res.status(400).json({ message: "Thông tin tuyển sinh của người dùng này đã tồn tại!" });
        }
        await AdmissionInformation.create({
            userId,
            firstName,
            lastName,
            birthDate,
            gender,
            birthPlace,
            phone,
            email,
            parentEmail,
            idNumber,
            idIssueDate,
            idIssuePlace,
            province,
            district,
            commune,
            address,
            houseNumber,
            streetName,
            status,
            feedback,
        });
        res.status(201).json({ message: "Thêm thông tin tuyển sinh thành công!" });
    } catch (error) {
        if (error instanceof Sequelize.ForeignKeyConstraintError) {
            return res.status(422).json({
                message: "Dữ liệu không hợp lệ: liên kết khóa ngoại không tồn tại (userId không tồn tại).",
            });
        }
        console.error("Lỗi khi thêm thông tin tuyển sinh:", error);
        res.status(500).json({ message: "Lỗi server khi thêm thông tin tuyển sinh." });
    }
};

export const updateAdInformation = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const existingInfo = await AdmissionInformation.findOne({ where: { userId: id } });
        if (!existingInfo) {
            return res.status(404).json({ message: "Không tìm thấy thông tin tuyển sinh!" });
        }
        // Validate status if provided
        if (updateData.status && !["waiting", "accepted", "rejected"].includes(updateData.status)) {
            return res.status(400).json({ message: "Trạng thái không hợp lệ!" });
        }
        updateData.status = "waiting";
        updateData.feedback = "";
        await existingInfo.update(updateData);
        res.status(200).json({ message: "Cập nhật thông tin tuyển sinh thành công!" });
    } catch (error) {
        console.error("Lỗi khi cập nhật thông tin tuyển sinh:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật thông tin tuyển sinh." });
    }
};

export const acceptAdInformation = async (req, res) => {
    try {
        const { id } = req.params;
        const existingInfo = await AdmissionInformation.findOne({ where: { userId: id } });
        if (!existingInfo) {
            return res.status(404).json({ message: "Thông tin tuyển sinh không tồn tại." });
        }
        await AdmissionInformation.update({ status: "accepted" }, { where: { userId: id } });
        res.status(200).json({ message: "Thông tin tuyển sinh đã được chấp nhận." });
    } catch (error) {
        console.error("Lỗi khi chấp nhận thông tin tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi chấp nhận thông tin tuyển sinh." });
    }
};

export const rejectAdInformation = async (req, res) => {
    try {
        const { id } = req.params;
        const { feedback } = req.body;
        const existingInfo = await AdmissionInformation.findOne({ where: { userId: id } });
        if (!existingInfo) {
            return res.status(404).json({ message: "Thông tin tuyển sinh không tồn tại." });
        }
        await AdmissionInformation.update({ status: "rejected", feedback: feedback }, { where: { userId: id } });
        res.status(200).json({ message: "Thông tin tuyển sinh đã bị từ chối." });
    } catch (error) {
        console.error("Lỗi khi từ chối thông tin tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi từ chối thông tin tuyển sinh." });
    }
};

export const getAllAdInformation = async (req, res) => {
    try {
        const allInformation = await AdmissionInformation.findAll();
        if (!allInformation || allInformation.length === 0) {
            return res.status(404).json({ message: "Không có thông tin tuyển sinh nào." });
        }
        res.status(200).json(allInformation);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách thông tin tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy danh sách thông tin tuyển sinh." });
    }
};

export const getAdmissionInformationStatusByID = async (req, res) => {
    const { id } = req.params;
    try {
        const admissionInfo = await AdmissionInformation.findOne({
            where: { userId: id },
            attributes: ["status"],
        });
        if (!admissionInfo) {
            return res.status(404).json({ message: "Không tìm thấy thông tin tuyển sinh." });
        }
        res.status(200).json({ status: admissionInfo.status });
    } catch (error) {
        console.error("Lỗi khi lấy trạng thái thông tin tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy trạng thái thông tin tuyển sinh." });
    }
};

export const getAdmissionInformationByID = async (req, res) => {
    const { id } = req.params;
    try {
        const admissionInfo = await AdmissionInformation.findOne({ where: { userId: id } });
        if (!admissionInfo) {
            return res.status(404).json({ message: "Không tìm thấy thông tin tuyển sinh." });
        }
        res.status(200).json(admissionInfo);
    } catch (error) {
        console.error("Lỗi khi lấy thông tin tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy thông tin tuyển sinh." });
    }
};

export const getFirstAndLastNameByID = async (req, res) => {
    const { id } = req.params;
    try {
        const admissionInfo = await AdmissionInformation.findOne({
            where: { userId: id },
            attributes: ["firstName", "lastName"],
        });
        if (!admissionInfo) {
            return res.status(404).json({ message: "Không tìm thấy thông tin thí sinh." });
        }
        res.status(200).json(admissionInfo);
    } catch (error) {
        console.error("Lỗi khi lấy họ và tên thí sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy họ và tên thí sinh." });
    }
};

export const getBasicAdmissionInfo = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "Thiếu userId trong yêu cầu." });
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
            return res.status(404).json({ message: "Không tìm thấy thông tin." });
        }
        const [transcript, learning] = await Promise.all([
            Transcript.findOne({ where: { userId }, attributes: ["status", "feedback"] }),
            LearningProcess.findOne({ where: { userId }, attributes: ["status", "feedback"] }),
        ]);
        // Chuyển về dạng plain object
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
                .map((p) => `-${p.name}: ${p.feedback.trim()}`)
                .join("\n") || null;
        // Format data: nếu không có thì gán "Chưa cập nhật"
        const result = {
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
        res.status(200).json({ message: "Lấy thông tin thành công!", data: result });
    } catch (error) {
        console.error("Lỗi khi lấy thông tin cơ bản:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi truy vấn dữ liệu." });
    }
};
