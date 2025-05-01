import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; // Import kết nối database

const AdmissionCriteria = sequelize.define(
    "AdmissionCriteria",
    {
        criteriaId: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        criteriaName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        criteriaDescription: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "admission_criterias", // Tên bảng trong MySQL
        timestamps: false, // Không cần createdAt và updatedAt
    }
);

export default AdmissionCriteria;
