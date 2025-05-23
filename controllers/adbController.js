import AdmissionBlock from "../models/admissionBlock.js";
import * as admissionBlockService from "../services/admissionBlockService.js";

export const addAdBlock = async (req, res) => {
    try {
        const message = await admissionBlockService.addAdmissionBlock(req.body);
        res.status(201).json({ message });
    } catch (error) {
        console.error("Lỗi khi thêm khối tuyển sinh:", error.message);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ message: error.message || "Lỗi phát sinh trong quá trình thêm khối tuyển sinh" });
    }
};

export const getAllAdBlocks = async (req, res) => {
    try {
        const adBlocks = await admissionBlockService.getAllAdmissionBlocks();
        res.status(200).json(adBlocks);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách khối tuyển sinh:", error.message);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ message: error.message || "Lỗi phát sinh trong quá trình lấy dữ liệu" });
    }
};

export const updateAdBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await admissionBlockService.updateAdmissionBlock(id, req.body);
        res.status(200).json({ message });
    } catch (error) {
        console.error("Lỗi khi cập nhật khối xét tuyển:", error.message);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || "Lỗi server khi cập nhật khối xét tuyển.",
        });
    }
};

export const deleteAdBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await admissionBlockService.deleteAdmissionBlock(id);
        res.status(200).json({ message });
    } catch (error) {
        console.error("Lỗi khi xóa khối xét tuyển:", error.message);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || "Lỗi server khi xóa khối xét tuyển.",
        });
    }
};

export const exportAdBlocks = async (req, res) => {
    try {
        const adBlocks = await AdmissionBlock.findAll();
        if (!adBlocks || adBlocks.length === 0) {
            return res.status(404).json({ message: "Không có dữ liệu khối tuyển sinh để xuất" });
        }

        // Format data for export
        const exportData = adBlocks.map((block) => ({
            admissionBlockId: block.admissionBlockId,
            admissionBlockName: block.admissionBlockName,
            admissionBlockSubject1: block.admissionBlockSubject1,
            admissionBlockSubject2: block.admissionBlockSubject2,
            admissionBlockSubject3: block.admissionBlockSubject3,
        }));

        res.status(200).json(exportData);
    } catch (error) {
        console.error("Lỗi khi xuất dữ liệu khối tuyển sinh:", error);
        res.status(500).json({ message: "Lỗi server khi xuất dữ liệu khối tuyển sinh" });
    }
};

export const importAdBlocks = async (req, res) => {
    try {
        const { adBlocks } = req.body;

        if (!Array.isArray(adBlocks)) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
        }

        const results = {
            success: [],
            errors: [],
        };

        for (const block of adBlocks) {
            try {
                const existingBlock = await AdmissionBlock.findOne({
                    where: { admissionBlockId: block.admissionBlockId },
                });

                if (existingBlock) {
                    // Update existing block
                    await AdmissionBlock.update(
                        {
                            admissionBlockName: block.admissionBlockName,
                            admissionBlockSubject1: block.admissionBlockSubject1,
                            admissionBlockSubject2: block.admissionBlockSubject2,
                            admissionBlockSubject3: block.admissionBlockSubject3,
                        },
                        { where: { admissionBlockId: block.admissionBlockId } }
                    );
                    results.success.push(block.admissionBlockId);
                } else {
                    // Create new block
                    await AdmissionBlock.create({
                        admissionBlockId: block.admissionBlockId,
                        admissionBlockName: block.admissionBlockName,
                        admissionBlockSubject1: block.admissionBlockSubject1,
                        admissionBlockSubject2: block.admissionBlockSubject2,
                        admissionBlockSubject3: block.admissionBlockSubject3,
                    });
                    results.success.push(block.admissionBlockId);
                }
            } catch (error) {
                results.errors.push({
                    id: block.admissionBlockId,
                    error: error.message,
                });
            }
        }

        res.status(200).json({
            message: "Import hoàn tất",
            results,
        });
    } catch (error) {
        console.error("Lỗi khi import dữ liệu khối tuyển sinh:", error);
        res.status(500).json({ message: "Lỗi server khi import dữ liệu khối tuyển sinh" });
    }
};
