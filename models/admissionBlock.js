import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const AdmissionBlock = sequelize.define(
    "AdmissionBlock",
    {
        admissionBlockId: {
            type: DataTypes.STRING,
            primaryKey: true, // Đặt làm khóa chính
        },
        admissionBlockName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        admissionBlockSubject1: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        admissionBlockSubject2: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        admissionBlockSubject3: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "admission_blocks", // Tên bảng trong MySQL
        timestamps: false, // Không cần createdAt và updatedAt
    }
);

export default AdmissionBlock;
