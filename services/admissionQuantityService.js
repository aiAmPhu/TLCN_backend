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

export const importAdQuantities = async (data) => {
    const { data: importData } = data;
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors = [];

    if (!importData || !Array.isArray(importData)) {
        throw new ApiError(400, "Dữ liệu import không hợp lệ.");
    }

    for (const item of importData) {
        try {
            const { majorId, criteriaId, quantity } = item;

            // Validate required fields
            if (!majorId || !criteriaId || quantity === undefined || quantity === null) {
                errorCount++;
                errors.push(`Thiếu thông tin bắt buộc: majorId=${majorId}, criteriaId=${criteriaId}, quantity=${quantity}`);
                continue;
            }

            // Check if record already exists
            const existingRecord = await AdmissionQuantity.findOne({
                where: { majorId, criteriaId },
            });

            if (existingRecord) {
                // Update existing record
                await existingRecord.update({ quantity: parseInt(quantity) });
                successCount++;
            } else {
                // Create new record
                const maxRecord = await AdmissionQuantity.findOne({
                    order: [["aqId", "DESC"]],
                });
                const newId = maxRecord ? maxRecord.aqId + 1 : 1;

                await AdmissionQuantity.create({
                    aqId: newId,
                    majorId,
                    criteriaId,
                    quantity: parseInt(quantity),
                });
                successCount++;
            }
        } catch (error) {
            errorCount++;
            if (error instanceof Sequelize.ForeignKeyConstraintError) {
                errors.push(`Dữ liệu không hợp lệ (khóa ngoại): majorId=${item.majorId}, criteriaId=${item.criteriaId}`);
            } else {
                errors.push(`Lỗi xử lý: ${error.message}`);
            }
        }
    }

    return {
        message: "Import hoàn thành",
        success: successCount,
        skipped: skippedCount,
        errors: errorCount,
        errorDetails: errors.length > 0 ? errors : undefined
    };
};
