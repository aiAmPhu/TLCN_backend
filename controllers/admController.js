import AdmissionMajor from "../models/admissionMajor.js";

export const addAdMajor = async (req, res) => {
    try {
        const { majorId, majorCodeName, majorName, majorCombination, majorDescription } = req.body;
        const existingMajor = await AdmissionMajor.findOne({ where: { majorId } });
        if (existingMajor) {
            return res.status(400).json({ message: "Chuyên ngành đã tồn tại" });
        }
        const newMajor = new AdmissionMajor({
            majorId,
            majorCodeName,
            majorName,
            majorCombination,
            majorDescription,
        });
        await newMajor.save();
        res.status(201).json({ message: "Chuyên ngành đã được tạo" });
    } catch (error) {
        console.error("Error adding major:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getAllAdMajors = async (req, res) => {
    try {
        const majors = await AdmissionMajor.findAll();
        if (!majors || majors.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy ngành tuyển sinh nào." });
        }
        res.status(200).json(majors);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách ngành tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy danh sách ngành tuyển sinh." });
    }
};

export const getMajorCombinationByID = async (req, res) => {
    try {
        const { id } = req.params;
        const major = await AdmissionMajor.findOne({
            where: { majorId: id },
        });
        if (!major) {
            return res.status(404).json({ message: "Không tìm thấy ngành tuyển sinh." });
        }
        res.status(200).json({ majorCombination: major.majorCombination });
    } catch (error) {
        console.error("Lỗi khi lấy tổ hợp xét tuyển:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy tổ hợp xét tuyển." });
    }
};

export const updateAdMajor = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const existingMajor = await AdmissionMajor.findOne({ where: { majorId: id } });
        if (!existingMajor) {
            return res.status(404).json({ message: "Không tìm thấy ngành tuyển sinh." });
        }
        await AdmissionMajor.update(updateData, { where: { majorId: id } });
        res.status(200).json({ message: "Cập nhật ngành tuyển sinh thành công." });
    } catch (error) {
        console.error("Lỗi khi cập nhật ngành tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật ngành tuyển sinh." });
    }
};

export const deleteAdMajor = async (req, res) => {
    try {
        const { id } = req.params;
        const existingMajor = await AdmissionMajor.findOne({ where: { majorId: id } });
        if (!existingMajor) {
            return res.status(404).json({ message: "Không tìm thấy ngành tuyển sinh." });
        }
        await AdmissionMajor.destroy({ where: { majorId: id } });
        res.status(200).json({ message: "Xóa ngành tuyển sinh thành công." });
    } catch (error) {
        console.error("Lỗi khi xóa ngành tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi xóa ngành tuyển sinh." });
    }
};
