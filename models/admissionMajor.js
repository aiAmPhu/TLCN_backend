import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const AdmissionMajor = sequelize.define(
    "AdmissionMajor",
    {
        majorId: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        majorCodeName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        majorName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        majorCombination: {
            type: DataTypes.JSON, // Lưu mảng các tổ hợp xét tuyển
            allowNull: true,
        },
        majorDescription: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "admission_majors",
        timestamps: false, // Không cần createdAt và updatedAt
    }
);

export default AdmissionMajor;
