import AdmissionBlock from "../models/admissionBlock.js";
import { ApiError } from "../utils/ApiError.js";

export const addAdmissionBlock = async (data) => {
    const { admissionBlockId } = data;
    const existingAdBlock = await AdmissionBlock.findOne({ where: { admissionBlockId } });
    if (existingAdBlock) {
        throw new ApiError(400, "Khối tuyển sinh đã tồn tại");
    }
    await AdmissionBlock.create(data);
    return "Tạo khối tuyển sinh thành công";
};

export const getAllAdmissionBlocks = async () => {
    const adBlocks = await AdmissionBlock.findAll();
    if (!adBlocks || adBlocks.length === 0) {
        throw new ApiError(404, "Không tìm được khối tuyển sinh");
    }
    return adBlocks;
};

export const updateAdmissionBlock = async (id, data) => {
    const adBlock = await AdmissionBlock.findOne({ where: { admissionBlockId: id } });
    if (!adBlock) {
        throw new ApiError(404, "Khối xét tuyển không tồn tại.");
    }
    await AdmissionBlock.update(
        {
            admissionBlockName: data.admissionBlockName,
            admissionBlockSubject1: data.admissionBlockSubject1,
            admissionBlockSubject2: data.admissionBlockSubject2,
            admissionBlockSubject3: data.admissionBlockSubject3,
        },
        { where: { admissionBlockId: id } }
    );
    return "Cập nhật khối xét tuyển thành công.";
};

export const deleteAdmissionBlock = async (id) => {
    const adBlock = await AdmissionBlock.findOne({ where: { admissionBlockId: id } });
    if (!adBlock) {
        throw new ApiError(404, "Khối xét tuyển không tồn tại.");
    }
    await AdmissionBlock.destroy({ where: { admissionBlockId: id } });
    return "Xóa khối xét tuyển thành công.";
};
