import AdmissionRegion from "../models/admissionRegion.js";
import { ApiError } from "../utils/ApiError.js";
export const addAdRegion = async (data) => {
    const { regionId } = data;
    const existingRegion = await AdmissionRegion.findOne({ where: { regionId } });
    if (existingRegion) {
        throw new ApiError(400, "Region ID đã tồn tại.");
    }
    await AdmissionRegion.create(data);
    return "Thêm khu vực thành công.";
};

export const getAllAdRegions = async () => {
    const regions = await AdmissionRegion.findAll();
    if (!regions || regions.length === 0) {
        throw new ApiError(404, "Không có khu vực tuyển sinh nào.");
    }
    return regions;
};

export const updateAdRegion = async (id, data) => {
    const existingRegion = await AdmissionRegion.findOne({ where: { regionId: id } });
    if (!existingRegion) {
        throw new ApiError(404, "Không tìm thấy khu vực tuyển sinh với ID này.");
    }
    await AdmissionRegion.update(data, { where: { regionId: id } });
    return { message: "Cập nhật khu vực tuyển sinh thành công." };
};

export const deleteAdRegion = async (id) => {
    const existingRegion = await AdmissionRegion.findOne({ where: { regionId: id } });
    if (!existingRegion) {
        throw new ApiError(404, "Không tìm thấy vùng tuyển sinh với ID này.");
    }
    await AdmissionRegion.destroy({ where: { regionId: id } });
    return { message: "Xóa vùng tuyển sinh thành công." };
};
