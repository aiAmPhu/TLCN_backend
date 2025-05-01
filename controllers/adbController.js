import AdmissionBlock from "../models/admissionBlock.js";

export const addAdBlock = async (req, res) => {
    try {
        const {
            admissionBlockId,
            admissionBlockName,
            admissionBlockSubject1,
            admissionBlockSubject2,
            admissionBlockSubject3,
        } = req.body;
        const existingAdBlock = await AdmissionBlock.findOne({ where: { admissionBlockId } });
        if (existingAdBlock) {
            return res.status(400).json({ message: "Khối tuyển sinh đã tồn tại" });
        }
        await AdmissionBlock.create({
            admissionBlockId,
            admissionBlockName,
            admissionBlockSubject1,
            admissionBlockSubject2,
            admissionBlockSubject3,
        });
        res.status(201).json({ message: "Tạo khối tuyển sinh thành công" });
    } catch (error) {
        console.error("Lỗi khi thêm khối tuyển sinh:", error);
        res.status(500).json({ message: "Lỗi phát sinh trong quá trình thêm: ", error: error.message });
    }
};

export const getAllAdBlocks = async (req, res) => {
    try {
        const adBlocks = await AdmissionBlock.findAll();
        if (!adBlocks || adBlocks.length === 0) {
            return res.status(404).json({ message: "Không tìm được khối tuyển sinh" });
        }
        res.status(200).json(adBlocks);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách khối tuyển sinh: ", error);
        res.status(500).json({ message: "Lỗi phát sinh trong quá trình thêm: ", error: error.message });
    }
};

export const getAllSubjectsByAdmissionBlockId = async (req, res) => {
    try {
        const { admissionBlockId } = req.params;
        const adBlock = await AdmissionBlock.findOne({
            where: { admissionBlockId },
        });
        if (!adBlock) {
            return res.status(404).json({ message: "Không tìm thấy khối tuyển sinh" });
        }
        const subjects = [
            adBlock.admissionBlockSubject1,
            adBlock.admissionBlockSubject2,
            adBlock.admissionBlockSubject3,
        ].filter((subject) => subject !== null); // Lọc bỏ giá trị null
        res.status(200).json({ subjects });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách môn học:", error);
        res.status(500).json({ message: "Lỗi phát sinh trong quá trình lấy môn học: ", error: error.message });
    }
};

export const updateAdBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const { admissionBlockName, admissionBlockSubject1, admissionBlockSubject2, admissionBlockSubject3 } = req.body;
        const adBlock = await AdmissionBlock.findOne({ where: { admissionBlockId: id } });
        if (!adBlock) {
            return res.status(404).json({ message: "Khối xét tuyển không tồn tại." });
        }
        await AdmissionBlock.update(
            {
                admissionBlockName,
                admissionBlockSubject1,
                admissionBlockSubject2,
                admissionBlockSubject3,
            },
            { where: { admissionBlockId: id } }
        );
        res.status(200).json({ message: "Cập nhật khối xét tuyển thành công." });
    } catch (error) {
        console.error("Lỗi khi cập nhật khối xét tuyển:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật khối xét tuyển." });
    }
};

export const deleteAdBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const adBlock = await AdmissionBlock.findOne({ where: { admissionBlockId: id } });
        if (!adBlock) {
            return res.status(404).json({ message: "Khối xét tuyển không tồn tại." });
        }
        await AdmissionBlock.destroy({ where: { admissionBlockId: id } });
        res.status(200).json({ message: "Xóa khối xét tuyển thành công." });
    } catch (error) {
        console.error("Lỗi khi xóa khối xét tuyển:", error);
        res.status(500).json({ message: "Lỗi server khi xóa khối xét tuyển." });
    }
};
