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
        console.log("Received data:", adBlocks); // Log dữ liệu nhận được

        if (!Array.isArray(adBlocks)) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
        }

        const results = {
            success: [],
            errors: [],
        };

        for (const block of adBlocks) {
            try {
                console.log("Processing block:", block); // Log từng block đang xử lý

                const existingBlock = await AdmissionBlock.findOne({
                    where: { admissionBlockId: block.admissionBlockId },
                });

                if (existingBlock) {
                    console.log("Updating existing block:", block.admissionBlockId);
                    const [updatedRows] = await AdmissionBlock.update(
                        {
                            admissionBlockName: block.admissionBlockName,
                            admissionBlockSubject1: block.admissionBlockSubject1,
                            admissionBlockSubject2: block.admissionBlockSubject2,
                            admissionBlockSubject3: block.admissionBlockSubject3,
                        },
                        { where: { admissionBlockId: block.admissionBlockId } }
                    );
                    console.log("Update result:", updatedRows);
                    if (updatedRows > 0) {
                        results.success.push(block.admissionBlockId);
                    } else {
                        throw new Error("Không thể cập nhật khối tuyển sinh");
                    }
                } else {
                    console.log("Creating new block:", block.admissionBlockId);
                    const newBlock = await AdmissionBlock.create({
                        admissionBlockId: block.admissionBlockId,
                        admissionBlockName: block.admissionBlockName,
                        admissionBlockSubject1: block.admissionBlockSubject1,
                        admissionBlockSubject2: block.admissionBlockSubject2,
                        admissionBlockSubject3: block.admissionBlockSubject3,
                    });
                    console.log("Create result:", newBlock);
                    if (newBlock) {
                        results.success.push(block.admissionBlockId);
                    } else {
                        throw new Error("Không thể tạo khối tuyển sinh mới");
                    }
                }
            } catch (error) {
                console.error(`Lỗi khi xử lý khối ${block.admissionBlockId}:`, error);
                results.errors.push({
                    id: block.admissionBlockId,
                    error: error.message,
                });
            }
        }

        // Kiểm tra kết quả sau khi import
        const totalBlocks = await AdmissionBlock.count();
        console.log("Total blocks after import:", totalBlocks);

        res.status(200).json({
            message: "Import hoàn tất",
            results,
            summary: {
                totalProcessed: adBlocks.length,
                successCount: results.success.length,
                errorCount: results.errors.length,
                totalInDatabase: totalBlocks
            }
        });
    } catch (error) {
        console.error("Lỗi khi import dữ liệu khối tuyển sinh:", error);
        res.status(500).json({ 
            message: "Lỗi server khi import dữ liệu khối tuyển sinh",
            error: error.message 
        });
    }
};
