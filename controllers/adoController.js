import AdmissionObject from "../models/admissionObject.js";

export const addAdObject = async (req, res) => {
    try {
        const { objectId, objectName, objectScored, objectDescription } = req.body;
        const existingObject = await AdmissionObject.findOne({ where: { objectId } });
        if (existingObject) {
            return res.status(400).json({ message: "Đối tượng tuyển sinh đã tồn tại." });
        }
        await AdmissionObject.create({
            objectId,
            objectName,
            objectScored,
            objectDescription,
        });
        res.status(201).json({ message: "Thêm đối tượng ưu tiên thành công." });
    } catch (error) {
        console.error("Lỗi khi thêm đối tượng ưu tiên:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi thêm đối tượng ưu tiên." });
    }
};

export const getAllAdObjects = async (req, res) => {
    try {
        const objects = await AdmissionObject.findAll();
        if (!objects || objects.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đối tượng ưu tiên nào." });
        }
        res.status(200).json(objects);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách đối tượng ưu tiên:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy danh sách đối tượng ưu tiên." });
    }
};

export const getScoreByID = async (req, res) => {
    try {
        const { id } = req.params;
        const admissionObject = await AdmissionObject.findOne({ where: { objectId: id } });
        if (!admissionObject) {
            return res.status(404).json({ message: "Không tìm thấy đối tượng ưu tiên." });
        }
        res.status(200).json(admissionObject.objectScored);
    } catch (error) {
        console.error("Lỗi khi lấy điểm ưu tiên:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy điểm ưu tiên." });
    }
};

export const updateAdObject = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const existingObject = await AdmissionObject.findOne({ where: { objectId: id } });
        if (!existingObject) {
            return res.status(404).json({ message: "Không tìm thấy đối tượng tuyển sinh." });
        }
        await AdmissionObject.update(updateData, { where: { objectId: id } });
        res.status(200).json({ message: "Cập nhật đối tượng tuyển sinh thành công." });
    } catch (error) {
        console.error("Lỗi khi cập nhật đối tượng tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật đối tượng tuyển sinh." });
    }
};

export const deleteAdObject = async (req, res) => {
    try {
        const { id } = req.params;
        const existingObject = await AdmissionObject.findOne({ where: { objectId: id } });
        if (!existingObject) {
            return res.status(404).json({ message: "Không tìm thấy đối tượng tuyển sinh." });
        }
        await AdmissionObject.destroy({ where: { objectId: id } });
        res.status(200).json({ message: "Xóa đối tượng tuyển sinh thành công." });
    } catch (error) {
        console.error("Lỗi khi xóa đối tượng tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi xóa đối tượng tuyển sinh." });
    }
};
