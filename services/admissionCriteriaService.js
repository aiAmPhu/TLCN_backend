import AdmissionCriteria from "../models/admissionCriteria.js";
import { ApiError } from "../utils/ApiError.js";

export const addAdCriteria = async (data) => {
    const { criteriaId, criteriaName, criteriaDescription } = data;
    const existingCriteria = await AdmissionCriteria.findOne({ where: { criteriaId } });
    if (existingCriteria) {
        throw new ApiError(400, "Tiêu chí xét tuyển đã tồn tại.");
    }
    await AdmissionCriteria.create({
        criteriaId,
        criteriaName,
        criteriaDescription,
    });
    return "Thêm tiêu chí xét tuyển thành công.";
};

export const getAllAdmissionCriterias = async () => {
    const adCriterias = await AdmissionCriteria.findAll();
    if (!adCriterias || adCriterias.length === 0) {
        throw new ApiError(404, "Không tìm được chỉ tiêu xét tuyển.");
    }
    return adCriterias;
};

export const updateAdmissionCriteria = async (id, data) => {
    const { criteriaName, criteriaDescription } = data;
    const criteria = await AdmissionCriteria.findByPk(id);
    if (!criteria) {
        throw new ApiError(404, "Không tìm thấy tiêu chí xét tuyển.");
    }
    await criteria.update({
        criteriaName: criteriaName || criteria.criteriaName,
        criteriaDescription: criteriaDescription || criteria.criteriaDescription,
    });
    return "Cập nhật tiêu chí xét tuyển thành công!";
};

export const deleteAdmissionCriteria = async (id) => {
    const criteria = await AdmissionCriteria.findByPk(id);
    if (!criteria) {
        throw new ApiError(404, "Không tìm thấy tiêu chí xét tuyển.");
    }
    await criteria.destroy();
    return "Xóa tiêu chí xét tuyển thành công!";
};
