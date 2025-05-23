import AdmissionMajor from "../models/admissionMajor.js";
import AdmissionBlock from "../models/admissionBlock.js";
import { ApiError } from "../utils/ApiError.js";

export const addAdMajor = async (data) => {
    const existingMajor = await AdmissionMajor.findOne({ where: { majorId: data.majorId } });
    if (existingMajor) {
        throw new ApiError(400, "Chuyên ngành đã tồn tại");
    }
    const blocks = await AdmissionBlock.findAll({ attributes: ["admissionBlockId"] });
    const validBlocks = new Set(blocks.map((block) => block.admissionBlockId));
    const invalidBlocks = data.majorCombination.filter((block) => !validBlocks.has(block));
    if (invalidBlocks.length > 0) {
        throw new ApiError(400, `Các khối sau không hợp lệ (không có trong bảng Blocks): ${invalidBlocks.join(", ")}.`);
    }
    await AdmissionMajor.create(data);
    return "Chuyên ngành đã được tạo";
};

export const getAllAdMajors = async () => {
    const majors = await AdmissionMajor.findAll();
    if (!majors || majors.length === 0) {
        throw new ApiError(404, "Không tìm thấy ngành tuyển sinh nào.");
    }
    return majors;
};

export const getMajorByID = async (id) => {
    const major = await AdmissionMajor.findOne({
        where: { majorId: id },
    });
    if (!major || major.length === 0) {
        throw new ApiError(404, "Không tìm thấy ngành tuyển sinh này.");
    }
    return major;
};

export const getMajorCombinationByID = async (id) => {
    const major = await AdmissionMajor.findOne({
        where: { majorId: id },
    });
    if (!major || major.length === 0) {
        throw new ApiError(404, "Không tìm thấy ngành tuyển sinh.");
    }
    return major.majorCombination;
};

export const updateAdMajor = async (id, data) => {
    const existingMajor = await AdmissionMajor.findOne({ where: { majorId: id } });
    if (!existingMajor) {
        throw new ApiError(404, "Không tìm thấy ngành tuyển sinh.");
    }
    await AdmissionMajor.update(data, { where: { majorId: id } });
    return "Cập nhật ngành tuyển sinh thành công.";
};

export const deleteAdMajor = async (id) => {
    const existingMajor = await AdmissionMajor.findOne({ where: { majorId: id } });
    if (!existingMajor) {
        throw new ApiError(404, "Không tìm thấy ngành tuyển sinh.");
    }
    await AdmissionMajor.destroy({ where: { majorId: id } });
    return "Xóa ngành tuyển sinh thành công.";
};
