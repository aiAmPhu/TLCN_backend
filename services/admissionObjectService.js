import AdmissionObject from "../models/admissionObject.js";
import { ApiError } from "../utils/ApiError.js";

export const addAdObject = async (data) => {
    const { objectId } = data;
    const existingObject = await AdmissionObject.findOne({ where: { objectId } });
    if (existingObject) {
        throw new ApiError(400, "Đối tượng tuyển sinh đã tồn tại.");
    }
    await AdmissionObject.create(data);
    return "Thêm đối tượng ưu tiên thành công.";
};

export const getAllAdObjects = async () => {
    const objects = await AdmissionObject.findAll();
    if (!objects || objects.length === 0) {
        throw new ApiError(404, "Không tìm thấy đối tượng ưu tiên nào.");
    }
    return objects;
};

export const updateAdObject = async (id, updateData) => {
    const existingObject = await AdmissionObject.findOne({ where: { objectId: id } });
    if (!existingObject) {
        throw new ApiError(404, "Không tìm thấy đối tượng tuyển sinh.");
    }
    await AdmissionObject.update(updateData, { where: { objectId: id } });
    return "Cập nhật đối tượng tuyển sinh thành công.";
};

export const deleteAdObject = async (id) => {
    const existingObject = await AdmissionObject.findOne({ where: { objectId: id } });
    if (!existingObject) {
        throw new ApiError(404, "Không tìm thấy đối tượng tuyển sinh.");
    }
    await AdmissionObject.destroy({ where: { objectId: id } });
    return "Xóa đối tượng tuyển sinh thành công.";
};
