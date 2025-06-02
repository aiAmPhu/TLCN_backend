import AdmissionYear from "../models/admissionYear.js";
import AdmissionYearConfig from "../models/admissionYearConfig.js";
import AdmissionCriteria from "../models/admissionCriteria.js";
import AdmissionMajor from "../models/admissionMajor.js";
import AdmissionObject from "../models/admissionObject.js";
import AdmissionRegion from "../models/admissionRegion.js";
import { Op } from "sequelize";
import { ApiError } from "../utils/ApiError.js";

// Tạo năm tuyển sinh mới
export const createAdmissionYear = async (data) => {
    const { yearId, yearName, startDate, endDate, description } = data;
    // Kiểm tra yearId đã tồn tại
    const existingYear = await AdmissionYear.findByPk(yearId);
    if (existingYear) {
        throw new ApiError(400, "Năm tuyển sinh đã tồn tại");
    }
    const admissionYear = await AdmissionYear.create({
        yearId,
        yearName,
        startDate,
        endDate,
        description,
        status: "inactive",
    });
    return admissionYear;
};
// Lấy tất cả năm tuyển sinh
export const getAllAdmissionYears = async () => {
    const years = await AdmissionYear.findAll({
        order: [["yearId", "DESC"]],
    });
    return years;
};
// Lấy năm tuyển sinh active
export const getActiveAdmissionYear = async () => {
    const activeYear = await AdmissionYear.findOne({
        where: { status: "active" },
    });
    return activeYear;
};
// Kích hoạt năm tuyển sinh
export const activateAdmissionYear = async (yearId) => {
    // Lấy thông tin năm hiện tại đang active (nếu có)
    const currentActiveYear = await AdmissionYear.findOne({
        where: { status: "active" },
    });
    // Tắt tất cả năm active
    await AdmissionYear.update({ status: "inactive" }, { where: { status: "active" } });
    // Tắt tất cả config cũ
    await AdmissionYearConfig.update({ isActive: false }, { where: { isActive: true } });
    const [updatedRows] = await AdmissionYear.update({ status: "active" }, { where: { yearId } });
    if (updatedRows === 0) {
        throw new ApiError(404, "Không tìm thấy năm tuyển sinh");
    }
    // Bật config cho năm này (nếu có)
    await AdmissionYearConfig.update({ isActive: true }, { where: { yearId } });
    const message = currentActiveYear
        ? `Đã kích hoạt năm ${yearId} và vô hiệu hóa năm ${currentActiveYear.yearId}`
        : `Đã kích hoạt năm tuyển sinh ${yearId}`;

    console.log(message);
    return { message };
};
// Cấu hình năm tuyển sinh
export const configureAdmissionYear = async (yearId, configData) => {
    try {
        console.log("Config data received:", configData);
        // Kiểm tra năm có đang active không
        const year = await AdmissionYear.findOne({
            where: { yearId, status: "active" },
        });
        if (!year) {
            throw new ApiError(403, "Chỉ có thể cấu hình năm tuyển sinh đang hoạt động");
        }
        const { criteria = [], majors = [], objects = [], regions = [] } = configData;
        // Tắt tất cả config cũ trước
        await AdmissionYearConfig.update({ isActive: false }, { where: { isActive: true } });
        // Tìm config hiện tại hoặc tạo mới
        const [config, created] = await AdmissionYearConfig.findOrCreate({
            where: { yearId },
            defaults: {
                yearId,
                criteriaIds: criteria,
                majorIds: majors,
                objectIds: objects,
                regionIds: regions,
                isActive: true, // Chỉ config này được active
            },
        });
        // Nếu đã tồn tại thì update
        if (!created) {
            await config.update({
                criteriaIds: criteria,
                majorIds: majors,
                objectIds: objects,
                regionIds: regions,
                isActive: true, // Đảm bảo active
            });
        }
        console.log(`${created ? "Created" : "Updated"} config for active year ${yearId}`);
        return config;
    } catch (error) {
        console.error("Error in configureAdmissionYear:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Lỗi khi cấu hình năm tuyển sinh: " + error.message);
    }
};
// Lấy cấu hình năm tuyển sinh
export const getAdmissionYearConfig = async (yearId) => {
    try {
        // Kiểm tra năm có active không
        const year = await AdmissionYear.findOne({
            where: { yearId },
        });
        if (!year) {
            throw new ApiError(404, "Không tìm thấy năm tuyển sinh");
        }
        const config = await AdmissionYearConfig.findOne({
            where: { yearId, isActive: true }, // Chỉ lấy config active
        });
        if (!config) {
            return {
                criteria: [],
                majors: [],
                objects: [],
                regions: [],
                isActive: year.status === "active", // Trả về trạng thái
            };
        }
        // Lấy chi tiết từ các bảng liên quan
        const [criteria, majors, objects, regions] = await Promise.all([
            AdmissionCriteria.findAll({
                where: { criteriaId: config.criteriaIds || [] },
                attributes: ["criteriaId", "criteriaName"],
            }),
            AdmissionMajor.findAll({
                where: { majorId: config.majorIds || [] },
                attributes: ["majorId", "majorName"],
            }),
            AdmissionObject.findAll({
                where: { objectId: config.objectIds || [] },
                attributes: ["objectId", "objectName"],
            }),
            AdmissionRegion.findAll({
                where: { regionId: config.regionIds || [] },
                attributes: ["regionId", "regionName"],
            }),
        ]);
        return {
            criteria: criteria || [],
            majors: majors || [],
            objects: objects || [],
            regions: regions || [],
            isActive: year.status === "active", // Trả về trạng thái năm
            configActive: config.isActive, // Trạng thái config
        };
    } catch (error) {
        console.error("Error in getAdmissionYearConfig:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Lỗi khi lấy cấu hình: " + error.message);
    }
};
// Lấy options cho năm tuyển sinh active
export const getActiveYearOptions = async () => {
    try {
        const activeYear = await getActiveAdmissionYear();
        if (!activeYear) {
            return {
                criteria: [],
                majors: [],
                objects: [],
                regions: [],
                message: "Không có năm tuyển sinh nào đang hoạt động",
            };
        }
        const config = await getAdmissionYearConfig(activeYear.yearId);
        return {
            ...config,
            activeYear: activeYear.yearName,
        };
    } catch (error) {
        console.error("Error in getActiveYearOptions:", error);
        return { criteria: [], majors: [], objects: [], regions: [] };
    }
};
// Kiểm tra quyền chỉnh sửa
export const canEditConfig = async (yearId) => {
    try {
        const year = await AdmissionYear.findOne({
            where: { yearId, status: "active" },
        });
        return !!year; // true nếu năm đang active
    } catch (error) {
        console.error("Error checking edit permission:", error);
        return false;
    }
};
// Kiểm tra option có được phép trong năm không
export const isOptionAllowedInYear = async (yearId, type, optionId) => {
    try {
        const config = await AdmissionYearConfig.findOne({
            where: { yearId, isActive: true },
        });
        if (!config) return false;
        const fieldName = `${type}Ids`; // criteriaIds, majorIds, objectIds, regionIds
        const allowedIds = config[fieldName] || [];
        return allowedIds.includes(optionId);
    } catch (error) {
        console.error("Error checking option permission:", error);
        return false;
    }
};
// Lấy thống kê cấu hình
export const getConfigStatistics = async (yearId) => {
    try {
        const config = await AdmissionYearConfig.findOne({
            where: { yearId, isActive: true },
        });
        if (!config) {
            return {
                totalCriteria: 0,
                totalMajors: 0,
                totalObjects: 0,
                totalRegions: 0,
            };
        }
        return {
            totalCriteria: (config.criteriaIds || []).length,
            totalMajors: (config.majorIds || []).length,
            totalObjects: (config.objectIds || []).length,
            totalRegions: (config.regionIds || []).length,
        };
    } catch (error) {
        console.error("Error getting config statistics:", error);
        throw new ApiError(500, "Lỗi khi lấy thống kê cấu hình");
    }
};
// So sánh qua các năm
export const compareYears = async (yearIds) => {
    const years = await AdmissionYear.findAll({
        where: { yearId: { [Op.in]: yearIds } },
        include: [
            {
                model: AdmissionYearConfig,
                include: [
                    { model: AdmissionMajor, attributes: ["majorName"] },
                    { model: AdmissionCriteria, attributes: ["criteriaName"] },
                ],
            },
        ],
    });
    return years;
};
// Thống kê theo năm
export const getYearStatistics = async (yearId) => {
    const stats = await AdmissionWishes.findAll({
        where: { yearId },
        attributes: [
            "status",
            [sequelize.fn("COUNT", sequelize.col("wishId")), "count"],
            [sequelize.fn("AVG", sequelize.col("scores")), "avgScore"],
            [sequelize.fn("MAX", sequelize.col("scores")), "maxScore"],
            [sequelize.fn("MIN", sequelize.col("scores")), "minScore"],
        ],
        group: ["status"],
        raw: true,
    });
    return stats;
};
