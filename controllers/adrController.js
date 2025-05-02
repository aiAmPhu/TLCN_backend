import AdmissionRegion from "../models/admissionRegion.js"; // Đổi tên model thành AdRegion

export const addAdRegion = async (req, res) => {
    try {
        const { regionId, regionName, regionScored } = req.body;
        const existingRegion = await AdmissionRegion.findOne({ where: { regionId } });
        if (existingRegion) {
            return res.status(400).json({ message: "Region ID đã tồn tại." });
        }
        await AdmissionRegion.create({
            regionId,
            regionName,
            regionScored,
        });
        res.status(201).json({ message: "Thêm khu vực thành công." });
    } catch (error) {
        console.error("Lỗi khi thêm khu vực:", error);
        res.status(500).json({ message: "Lỗi khi thêm khu vực." });
    }
};

export const getAllAdRegions = async (req, res) => {
    try {
        const regions = await AdmissionRegion.findAll();
        if (regions.length === 0) {
            return res.status(404).json({ message: "Không có vùng tuyển sinh nào." });
        }
        res.status(200).json(regions);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách vùng tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy danh sách vùng tuyển sinh." });
    }
};

export const updateAdRegion = async (req, res) => {
    try {
        const { id } = req.params;
        const { regionName, regionScored } = req.body;
        const existingRegion = await AdmissionRegion.findOne({ where: { regionId: id } });
        if (!existingRegion) {
            return res.status(404).json({ message: "Không tìm thấy vùng tuyển sinh với ID này." });
        }
        await AdmissionRegion.update({ regionName, regionScored }, { where: { regionId: id } });
        res.status(200).json({ message: "Cập nhật vùng tuyển sinh thành công." });
    } catch (error) {
        console.error("Lỗi khi cập nhật vùng tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật vùng tuyển sinh." });
    }
};

export const deleteAdRegion = async (req, res) => {
    try {
        const { id } = req.params;
        const existingRegion = await AdmissionRegion.findOne({ where: { regionId: id } });
        if (!existingRegion) {
            return res.status(404).json({ message: "Không tìm thấy vùng tuyển sinh với ID này." });
        }
        await AdmissionRegion.destroy({ where: { regionId: id } });
        res.status(200).json({ message: "Xóa vùng tuyển sinh thành công." });
    } catch (error) {
        console.error("Lỗi khi xóa vùng tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi xóa vùng tuyển sinh." });
    }
};
