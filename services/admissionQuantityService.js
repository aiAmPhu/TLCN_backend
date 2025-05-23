import AdmissionQuantity from "../models/admissionQuantity.js";
import { ApiError } from "../utils/ApiError.js";
import { Sequelize } from "sequelize";

export const addAdQuantity = async (data) => {
    const { majorId, criteriaId, quantity } = data;
    const maxRecord = await AdmissionQuantity.findOne({
        order: [["aqId", "DESC"]],
    });
    const newId = maxRecord ? maxRecord.aqId + 1 : 1;
    try {
        await AdmissionQuantity.create({
            aqId: newId,
            majorId,
            criteriaId,
            quantity,
        });
        return "Thêm mới thành công";
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            throw new ApiError(409, "Chỉ tiêu này đã tồn tại trong hệ thống.");
        }
        if (error instanceof Sequelize.ForeignKeyConstraintError) {
            throw new ApiError(422, "Dữ liệu không hợp lệ: liên kết khóa ngoại không tồn tại.");
        }
        console.error("Lỗi khi thêm dữ liệu:", error);
        throw new ApiError(500, "Lỗi khi thêm dữ liệu.");
    }
};

export const getAllAdQuantities = async () => {
    const admissionQuantities = await AdmissionQuantity.findAll({
        attributes: ["majorId", "criteriaId", "quantity"],
    });
    if (!admissionQuantities || admissionQuantities.length === 0) {
        throw new ApiError(404, "Không có dữ liệu tuyển sinh nào.");
    }
    return admissionQuantities;
};

export const updateAdQuantity = async (data) => {
    const { oldMajorId, oldCriteriaId, newMajorId, newCriteriaId, quantity } = data;
    const existingRecord = await AdmissionQuantity.findOne({
        where: {
            majorId: oldMajorId,
            criteriaId: oldCriteriaId,
        },
    });
    if (!existingRecord) {
        throw new ApiError(404, "Không tìm thấy chỉ tiêu phù hợp.");
    }
    // Nếu có thay đổi majorId hoặc criteriaId thì check trùng
    if (oldMajorId !== newMajorId || oldCriteriaId !== newCriteriaId) {
        const duplicateCheck = await AdmissionQuantity.findOne({
            where: {
                majorId: newMajorId,
                criteriaId: newCriteriaId,
            },
        });
        if (duplicateCheck) {
            throw new ApiError(409, "Chỉ tiêu cho ngành và diện xét tuyển này đã tồn tại.");
        }
    }
    try {
        await existingRecord.update({
            majorId: newMajorId,
            criteriaId: newCriteriaId,
            quantity: quantity,
        });
        return {
            message: "Cập nhật thành công!",
            updatedData: existingRecord,
        };
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            throw new ApiError(409, "Chỉ tiêu này đã tồn tại trong hệ thống.");
        }
        if (error instanceof Sequelize.ForeignKeyConstraintError) {
            throw new ApiError(422, "Dữ liệu không hợp lệ: liên kết khóa ngoại không tồn tại.");
        }
        throw new ApiError(500, "Đã xảy ra lỗi khi cập nhật dữ liệu.");
    }
};

export const deleteAdQuantity = async (data) => {
    const { majorId, criteriaId } = data;
    const existingRecord = await AdmissionQuantity.findOne({
        where: { majorId, criteriaId },
    });
    if (!existingRecord) {
        throw new ApiError(404, "Không tìm thấy chỉ tiêu cần xóa.");
    }
    await AdmissionQuantity.destroy({
        where: { majorId, criteriaId },
    });
    return { message: "Xóa chỉ tiêu thành công." };
};
