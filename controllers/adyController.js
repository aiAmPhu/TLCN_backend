import AdYear from "../models/admissionYear.js"; // Đổi tên model thành AdMajor

export const addAdYear = async (req, res) => {
    try {
        const { yearId, yearName, startDate, endDate, status } = req.body;
        const existingYear = await AdYear.findOne({ where: { yearId } });
        if (existingYear) {
            return res.status(400).json({ message: "Năm tuyển sinh đã tồn tại." });
        }
        await AdYear.create({
            yearId,
            yearName,
            startDate,
            endDate,
            status: status || "inactive", // Mặc định nếu không có status sẽ là "inactive"
        });
        res.status(201).json({ message: "Thêm năm tuyển sinh thành công!" });
    } catch (error) {
        console.error("Lỗi khi thêm năm tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi thêm năm tuyển sinh." });
    }
};

export const getAllAdYears = async (req, res) => {
    try {
        // Lấy tất cả các bản ghi từ bảng AdYear
        const adYears = await AdYear.findAll({
            order: [["yearId", "DESC"]], // Sắp xếp theo yearId giảm dần (mới nhất trước)
        });
        res.status(200).json({ message: "Lấy danh sách năm tuyển sinh thành công!", data: adYears });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách năm tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy danh sách năm tuyển sinh." });
    }
};

export const updateAdYear = async (req, res) => {
    try {
        const { yearId } = req.params;
        const updateData = req.body;
        const existingYear = await AdYear.findOne({ where: { yearId } });
        if (!existingYear) {
            return res.status(404).json({ message: "Năm tuyển sinh không tồn tại!" });
        }
        await AdYear.update(updateData, { where: { yearId } });
        res.status(200).json({ message: "Cập nhật năm tuyển sinh thành công!" });
    } catch (error) {
        console.error("Lỗi khi cập nhật năm tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật năm tuyển sinh." });
    }
};

export const deleteAdYear = async (req, res) => {
    try {
        const { yearId } = req.params;
        const existingYear = await AdYear.findOne({ where: { yearId } });
        if (!existingYear) {
            return res.status(404).json({ message: "Năm tuyển sinh không tồn tại!" });
        }
        await AdYear.destroy({ where: { yearId } });
        res.status(200).json({ message: "Xóa năm tuyển sinh thành công!" });
    } catch (error) {
        console.error("Lỗi khi xóa năm tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi xóa năm tuyển sinh." });
    }
};

// export const getAllYearMajors = async (req, res) => {
//     try {
//         // Chỉ lấy trường yearMajors
//         const { id } = req.params;
//         const years = await AdYear.find(id).select("yearMajors");
//         res.status(200).json(years);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
