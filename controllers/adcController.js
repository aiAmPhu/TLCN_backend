import AdCriteria from "../models/admissionCriteria.js";

export const addAdCriteria = async (req, res) => {
    try {
        const { criteriaId, criteriaName, criteriaDescription } = req.body;
        const existingCriteria = await AdCriteria.findOne({ where: { criteriaId } });
        if (existingCriteria) {
            return res.status(400).json({ message: "Tiêu chí xét tuyển đã tồn tại." });
        }
        await AdCriteria.create({
            criteriaId,
            criteriaName,
            criteriaDescription,
        });
        res.status(201).json({ message: "Thêm tiêu chí xét tuyển thành công." });
    } catch (error) {
        console.error("Lỗi khi thêm tiêu chí xét tuyển:", error);
        res.status(500).json({ message: "Lỗi server khi thêm tiêu chí xét tuyển." });
    }
};

export const getAllAdCriterias = async (req, res) => {
    try {
        const criterias = await AdCriteria.findAll();
        if (!criterias || criterias.length === 0) {
            return res.status(404).json({ message: "Không có tiêu chí xét tuyển nào." });
        }
        res.status(200).json(criterias);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách tiêu chí xét tuyển:", error);
        res.status(500).json({ message: "Lỗi server khi lấy danh sách tiêu chí xét tuyển." });
    }
};

export const updateAdCriteria = async (req, res) => {
    const { id } = req.params;
    const { criteriaName, criteriaDescription } = req.body;
    try {
        const criteria = await AdCriteria.findByPk(id);
        if (!criteria) {
            return res.status(404).json({ message: "Không tìm thấy tiêu chí xét tuyển." });
        }
        await criteria.update({
            criteriaName: criteriaName || criteria.criteriaName,
            criteriaDescription: criteriaDescription || criteria.criteriaDescription,
        });
        res.status(200).json({ message: "Cập nhật tiêu chí xét tuyển thành công!" });
    } catch (error) {
        console.error("Lỗi khi cập nhật tiêu chí xét tuyển:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật tiêu chí xét tuyển." });
    }
};

export const deleteAdCriteria = async (req, res) => {
    const { id } = req.params;
    try {
        const criteria = await AdCriteria.findByPk(id);
        if (!criteria) {
            return res.status(404).json({ message: "Không tìm thấy tiêu chí xét tuyển." });
        }
        await criteria.destroy();
        res.status(200).json({ message: "Xóa tiêu chí xét tuyển thành công!" });
    } catch (error) {
        console.error("Lỗi khi xóa tiêu chí xét tuyển:", error);
        res.status(500).json({ message: "Lỗi server khi xóa tiêu chí xét tuyển." });
    }
};
