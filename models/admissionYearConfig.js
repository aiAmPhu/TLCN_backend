import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import AdmissionYear from "./admissionYear.js";
import AdmissionCriteria from "./admissionCriteria.js";
import AdmissionMajor from "./admissionMajor.js";
import AdmissionObject from "./admissionObject.js";
import AdmissionRegion from "./admissionRegion.js";

const AdmissionYearConfig = sequelize.define(
    "AdmissionYearConfig",
    {
        configId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        yearId: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true, // ✅ Đảm bảo 1 năm chỉ có 1 config
            references: {
                model: AdmissionYear,
                key: "yearId",
            },
        },
        // ✅ Lưu danh sách IDs dạng JSON
        criteriaIds: {
            type: DataTypes.JSON, // MySQL: JSON, PostgreSQL: JSONB
            allowNull: true,
            defaultValue: [],
            comment: "Danh sách ID diện xét tuyển được phép",
        },
        majorIds: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
            comment: "Danh sách ID ngành được phép",
        },
        objectIds: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
            comment: "Danh sách ID đối tượng được phép",
        },
        regionIds: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
            comment: "Danh sách ID khu vực được phép",
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: "Mô tả cấu hình",
        },
    },
    {
        tableName: "admission_year_configs",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["yearId"],
            },
        ],
    }
);

// Associations
AdmissionYearConfig.belongsTo(AdmissionYear, { foreignKey: "yearId" });

export default AdmissionYearConfig;
