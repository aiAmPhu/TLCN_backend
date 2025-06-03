import * as statisticsSnapshotService from "../services/statisticsSnapshotService.js";
import StatisticsSnapshot from "../models/statisticsSnapshot.js";
export const createManualSnapshot = async (req, res) => {
    try {
        const { yearId, notes } = req.body;
        const userId = req.user.userId;

        const result = await statisticsSnapshotService.createManualSnapshot(yearId, userId, notes);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error in createManualSnapshot:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi khi tạo snapshot",
        });
    }
};

export const getSnapshots = async (req, res) => {
    try {
        const filters = req.query;
        const result = await statisticsSnapshotService.getSnapshots(filters);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in getSnapshots:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi khi lấy snapshots",
        });
    }
};

export const compareSnapshots = async (req, res) => {
    try {
        const { snapshotIds } = req.body; // Lấy từ body thay vì query
        const result = await statisticsSnapshotService.compareSnapshots(snapshotIds); // Gọi đúng service
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in compareSnapshots:", error); // Sửa log message
        res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi khi so sánh snapshots", // Sửa error message
        });
    }
};

export const getSnapshotById = async (req, res) => {
    try {
        const { snapshotId } = req.params;
        const snapshot = await StatisticsSnapshot.findByPk(snapshotId);

        if (!snapshot) {
            return res.status(404).json({
                message: "Không tìm thấy snapshot",
            });
        }

        res.status(200).json({
            message: "Lấy snapshot thành công",
            data: snapshot,
        });
    } catch (error) {
        console.error("Error in getSnapshotById:", error);
        res.status(500).json({
            message: "Lỗi khi lấy snapshot",
        });
    }
};

export const deleteSnapshot = async (req, res) => {
    try {
        const { snapshotId } = req.params;
        const snapshot = await StatisticsSnapshot.findByPk(snapshotId);

        if (!snapshot) {
            return res.status(404).json({
                message: "Không tìm thấy snapshot",
            });
        }

        await snapshot.destroy();

        res.status(200).json({
            message: "Xóa snapshot thành công",
        });
    } catch (error) {
        console.error("Error in deleteSnapshot:", error);
        res.status(500).json({
            message: "Lỗi khi xóa snapshot",
        });
    }
};
export const createYearlySnapshot = async (req, res) => {
    try {
        const { yearId, notes, snapshotType = "yearly_summary" } = req.body;
        const adminId = req.user.userId;

        const result = await statisticsSnapshotService.createYearlySnapshot(yearId, adminId, notes, snapshotType);

        res.status(201).json(result);
    } catch (error) {
        console.error("Error in createYearlySnapshot:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi khi tạo snapshot năm",
        });
    }
};
