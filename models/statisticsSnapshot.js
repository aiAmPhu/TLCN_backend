import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const StatisticsSnapshot = sequelize.define(
    "StatisticsSnapshot",
    {
        snapshotId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        yearId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: "admission_years",
                key: "yearId",
            },
        },
        yearName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        snapshotType: {
            type: DataTypes.ENUM("auto", "manual", "filter", "yearly_summary"),
            defaultValue: "auto",
            comment: "auto: tự động theo schedule, manual: admin tạo thủ công, filter: tạo khi filter wishes",
        },
        snapshotDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        // Thống kê tổng quan
        totalStudents: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalWishes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalMajors: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalCriteria: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalBlocks: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        // Thống kê trạng thái
        pendingWishes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        acceptedWishes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        rejectedWishes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        // JSON data cho chi tiết
        studentsByMajor: {
            type: DataTypes.JSON,
            comment: "Chi tiết số sinh viên theo từng ngành",
        },
        studentsByCriteria: {
            type: DataTypes.JSON,
            comment: "Chi tiết số sinh viên theo từng diện",
        },
        studentsByBlock: {
            type: DataTypes.JSON,
            comment: "Chi tiết số sinh viên theo từng khối",
        },
        majorDetails: {
            type: DataTypes.JSON,
            comment: "Danh sách chi tiết các ngành: ID, tên, mã",
        },
        criteriaDetails: {
            type: DataTypes.JSON,
            comment: "Danh sách chi tiết các diện: ID, tên, mô tả",
        },
        blockDetails: {
            type: DataTypes.JSON,
            comment: "Danh sách chi tiết các khối: ID, tên, môn học",
        },
        // Metadata
        filterConditions: {
            type: DataTypes.JSON,
            comment: "Điều kiện filter được áp dụng (nếu có)",
        },
        createdBy: {
            type: DataTypes.STRING,
            comment: "User tạo snapshot (nếu manual)",
        },
        notes: {
            type: DataTypes.TEXT,
            comment: "Ghi chú thêm",
        },
    },
    {
        tableName: "statistics_snapshots",
        timestamps: true,
    }
);

export default StatisticsSnapshot;
