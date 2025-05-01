import PhotoID from "../models/photoID.js";

export const addPhotoID = async (req, res) => {
    try {
        const { userId, personalPic, frontCCCD, backCCCD, grade10Pic, grade11Pic, grade12Pic } = req.body;
        const existingPhoto = await PhotoID.findOne({ where: { userId } });
        if (existingPhoto) {
            return res.status(400).json({ message: "User đã tồn tại." });
        }
        const newPhoto = await PhotoID.create({
            userId,
            personalPic,
            frontCCCD,
            backCCCD,
            grade10Pic,
            grade11Pic,
            grade12Pic,
            status: "waiting",
            feedback: null,
        });
        res.status(201).json({ message: "Thêm ảnh thành công!" });
    } catch (error) {
        console.error("Lỗi khi thêm ảnh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi thêm ảnh", error: error.message });
    }
};

export const acceptPhotoID = async (req, res) => {
    try {
        const { userId } = req.params;
        const photo = await PhotoID.findOne({ where: { userId } });
        if (!photo) {
            return res.status(404).json({ message: "Không tìm thấy ảnh hồ sơ" });
        }
        await photo.update({ status: "accepted" });
        res.json({
            message: "Đã chấp nhận ảnh hồ sơ thành công!",
        });
    } catch (error) {
        console.error("Lỗi khi thêm ảnh hồ sơ", error);
        res.status(500).json({ message: "Lỗi hệ thống, vui lòng thử lại sau!" });
    }
};

export const rejectPhotoID = async (req, res) => {
    try {
        const { userId } = req.params;
        const { feedback } = req.body;
        const photo = await PhotoID.findOne({ where: { userId } });
        if (!photo) {
            return res.status(404).json({ message: "Không tìm thấy ảnh hồ sơ!" });
        }
        await photo.update({ status: "rejected", feedback });
        res.json({
            message: "Từ chối ảnh hồ sơ thành công!",
        });
    } catch (error) {
        console.error("Lỗi khi từ chối ảnh hồ sơ:", error);
        res.status(500).json({ message: "Lỗi hệ thống, vui lòng thử lại sau!" });
    }
};

export const updatePhotoID = async (req, res) => {
    try {
        const { userId } = req.params;
        const updatedData = req.body;
        const photo = await PhotoID.findOne({ where: { userId } });
        if (!photo) {
            return res.status(404).json({ message: "Không tìm thấy ảnh hồ sơ!" });
        }
        updatedData.status = "waiting";
        updatedData.feedback = null;
        await photo.update(updatedData);
        res.json({
            message: "Cập nhật ảnh hồ sơ thành công!.",
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật ảnh hồ sơ:", error);
        res.status(500).json({ message: "Lỗi hệ thống, vui lòng thử lại sau!" });
    }
};

export const getAllPhotos = async (req, res) => {
    try {
        // Lấy toàn bộ dữ liệu từ bảng PhotoID
        const photos = await PhotoID.findAll();
        if (photos.length === 0) {
            return res.status(404).json({ message: "Không có ảnh hồ sơ nào!" });
        }
        res.json({
            message: "Lấy danh sách ảnh hồ sơ thành công!",
            data: photos,
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách ảnh hồ sơ:", error);
        res.status(500).json({ message: "Lỗi hệ thống, vui lòng thử lại sau!" });
    }
};

export const getPhotoStatusByUID = async (req, res) => {
    try {
        const { userId } = req.params;
        const photo = await PhotoID.findOne({
            where: { userId },
            attributes: ["status"],
        });
        if (!photo) {
            return res.status(404).json({ message: "Không tìm thấy ảnh hồ sơ cho người dùng này!" });
        }
        res.json({
            message: "Lấy trạng thái ảnh hồ sơ thành công!",
            status: photo.status,
        });
    } catch (error) {
        console.error("Lỗi khi lấy trạng thái ảnh hồ sơ:", error);
        res.status(500).json({ message: "Lỗi hệ thống, vui lòng thử lại sau!" });
    }
};

export const getPhotoByUID = async (req, res) => {
    try {
        const { userId } = req.params;
        const photo = await PhotoID.findOne({
            where: { userId },
        });
        if (!photo) {
            return res.status(404).json({ message: "Không tìm thấy ảnh hồ sơ cho người dùng này!" });
        }
        res.json({
            message: "Lấy ảnh hồ sơ thành công!",
            data: photo,
        });
    } catch (error) {
        console.error("Lỗi khi lấy ảnh hồ sơ:", error);
        res.status(500).json({ message: "Lỗi hệ thống, vui lòng thử lại sau!" });
    }
};
