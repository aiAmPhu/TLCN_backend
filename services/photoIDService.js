import PhotoID from "../models/photoID.js";
import { ApiError } from "../utils/ApiError.js";
import { Sequelize } from "sequelize";

export const addPhotoID = async (data) => {
    const { userId } = data;
    const existingPhoto = await PhotoID.findOne({ where: { userId } });
    if (existingPhoto) {
        throw new ApiError(400, "User đã tồn tại.");
    }
    try {
        await PhotoID.create({
            ...data,
            status: "waiting",
            feedback: null,
        });
        return { message: "Thêm ảnh thành công!" };
    } catch (error) {
        if (error instanceof Sequelize.ForeignKeyConstraintError) {
            throw new ApiError(422, "Dữ liệu không hợp lệ: liên kết khóa ngoại không tồn tại (userId không tồn tại).");
        }
        throw new ApiError(500, "Đã xảy ra lỗi khi thêm ảnh");
    }
};

export const updatePhotoID = async (userId, updatedData) => {
    const photo = await PhotoID.findOne({ where: { userId } });
    if (!photo) {
        throw new ApiError(404, "Không tìm thấy ảnh hồ sơ!");
    }
    updatedData.status = "waiting";
    updatedData.feedback = null;
    await photo.update(updatedData);
    return { message: "Cập nhật ảnh hồ sơ thành công!." };
};

export const acceptPhotoID = async (userId) => {
    const photo = await PhotoID.findOne({ where: { userId } });
    if (!photo) {
        throw new ApiError(404, "Không tìm thấy ảnh hồ sơ");
    }
    await photo.update({ status: "accepted" });
    return { message: "Đã chấp nhận ảnh hồ sơ thành công!" };
};

export const rejectPhotoID = async (userId, feedback) => {
    const photo = await PhotoID.findOne({ where: { userId } });
    if (!photo) {
        throw new ApiError(404, "Không tìm thấy ảnh hồ sơ!");
    }
    await photo.update({ status: "rejected", feedback });
    return { message: "Từ chối ảnh hồ sơ thành công!" };
};

export const getAllPhotos = async () => {
    const photos = await PhotoID.findAll();
    if (!photos || photos.length === 0) {
        throw new ApiError(404, "Không có ảnh hồ sơ nào!");
    }
    return photos;
};

export const getPhotoByUID = async (userId) => {
    const photo = await PhotoID.findOne({ where: { userId } });
    if (!photo) {
        throw new ApiError(404, "Không tìm thấy ảnh hồ sơ cho người dùng này!");
    }
    return photo;
};
