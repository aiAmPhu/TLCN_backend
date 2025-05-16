import AdmissionQuantity from "../models/admissionQuantity.js";
import AdmissionMajor from "../models/admissionMajor.js";
import AdmissionCriteria from "../models/admissionCriteria.js";
import { Sequelize } from "sequelize";

export const addAdQuantity = async (req, res) => {
    try {
        const { majorId, criteriaId, quantity } = req.body;
        const maxRecord = await AdmissionQuantity.findOne({
            order: [["aqId", "DESC"]],
        });
        const newId = maxRecord ? maxRecord.aqId + 1 : 1;
        await AdmissionQuantity.create({
            aqId: newId,
            majorId,
            criteriaId,
            quantity,
        });
        res.status(201).json({ message: "Thêm mới thành công" });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                message: "Chỉ tiêu này đã tồn tại trong hệ thống.",
            });
        }
        if (error instanceof Sequelize.ForeignKeyConstraintError) {
            return res.status(422).json({
                message: "Dữ liệu không hợp lệ: liên kết khóa ngoại không tồn tại .",
            });
        }
        console.error("Lỗi khi thêm dữ liệu:", error);
        res.status(500).json({ message: "Lỗi khi thêm dữ liệu." });
    }
};

export const getQuantityByCriteriaIdAndMajorId = async (req, res) => {
    try {
        const { majorId, criteriaId } = req.params;
        const admissionQuantity = await AdmissionQuantity.findOne({
            where: { majorId, criteriaId },
            include: [
                { model: AdmissionMajor, as: "major" },
                { model: AdmissionCriteria, as: "criteria" },
            ],
        });
        if (!admissionQuantity) {
            return res.status(404).json({
                message: "Không tìm thấy số lượng tuyển sinh với majorId và criteriaId đã cung cấp.",
            });
        }
        res.status(200).json(admissionQuantity.quantity);
    } catch (error) {
        console.error("Lỗi khi lấy số lượng tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy số lượng tuyển sinh." });
    }
};

export const getAllAdQuantities = async (req, res) => {
    try {
        const admissionQuantities = await AdmissionQuantity.findAll({
            attributes: ["majorId", "criteriaId", "quantity"],
        });
        if (!admissionQuantities || admissionQuantities.length === 0) {
            return res.status(404).json({ message: "Không có dữ liệu tuyển sinh nào." });
        }
        res.status(200).json(admissionQuantities);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách AdmissionQuantity:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy danh sách tuyển sinh." });
    }
};

export const updateAdQuantity = async (req, res) => {
    try {
        const { oldMajorId, oldCriteriaId, newMajorId, newCriteriaId, quantity } = req.body;
        
        // Kiểm tra record cũ có tồn tại không
        const existingRecord = await AdmissionQuantity.findOne({
            where: { 
                majorId: oldMajorId,
                criteriaId: oldCriteriaId
            }
        });

        if (!existingRecord) {
            return res.status(404).json({ message: "Không tìm thấy chỉ tiêu phù hợp." });
        }

        // Kiểm tra nếu có thay đổi majorId hoặc criteriaId
        if (oldMajorId !== newMajorId || oldCriteriaId !== newCriteriaId) {
            // Kiểm tra xem cặp mới đã tồn tại chưa
            const duplicateCheck = await AdmissionQuantity.findOne({
                where: {
                    majorId: newMajorId,
                    criteriaId: newCriteriaId
                }
            });

            if (duplicateCheck) {
                return res.status(409).json({
                    message: "Chỉ tiêu cho ngành và diện xét tuyển này đã tồn tại."
                });
            }
        }

        // Cập nhật record
        await existingRecord.update({
            majorId: newMajorId,
            criteriaId: newCriteriaId,
            quantity: quantity
        });

        res.status(200).json({ 
            message: "Cập nhật thành công!", 
            updatedData: existingRecord 
        });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                message: "Chỉ tiêu này đã tồn tại trong hệ thống.",
            });
        }
        if (error instanceof Sequelize.ForeignKeyConstraintError) {
            return res.status(422).json({
                message: "Dữ liệu không hợp lệ: liên kết khóa ngoại không tồn tại.",
            });
        }
        console.error("Lỗi khi cập nhật AdmissionQuantity:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật dữ liệu." });
    }
};

export const deleteAdQuantity = async (req, res) => {
    try {
        const { majorId, criteriaId } = req.body;
        
        const existingRecord = await AdmissionQuantity.findOne({ 
            where: { 
                majorId: majorId,
                criteriaId: criteriaId
            } 
        });

        if (!existingRecord) {
            return res.status(404).json({ message: "Không tìm thấy chỉ tiêu cần xóa." });
        }

        await AdmissionQuantity.destroy({ 
            where: { 
                majorId: majorId,
                criteriaId: criteriaId
            } 
        });

        res.status(200).json({ message: "Xóa chỉ tiêu thành công." });
    } catch (error) {
        console.error("Lỗi khi xóa dữ liệu:", error);
        res.status(500).json({ message: "Lỗi khi xóa dữ liệu." });
    }
};
