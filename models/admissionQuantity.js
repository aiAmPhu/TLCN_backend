import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; // Import kết nối MySQL
import AdmissionMajor from "./admissionMajor.js"; // Import bảng Major
import AdmissionCriteria from "./admissionCriteria.js"; // Import bảng Criteria

const AdmissionQuantity = sequelize.define(
    "AdmissionQuantity",
    {
        aqId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        majorId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: AdmissionMajor, // Liên kết đến bảng admission_majors
                key: "majorId",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        criteriaId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: AdmissionCriteria, // Liên kết đến bảng admission_criteria
                key: "criteriaId",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "admission_quantities",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["majorId", "criteriaId"], // Đảm bảo không có bản ghi trùng
            },
        ],
    }
);
AdmissionQuantity.belongsTo(AdmissionMajor, { foreignKey: "majorId" });
AdmissionQuantity.belongsTo(AdmissionCriteria, { foreignKey: "criteriaId" });
export default AdmissionQuantity;
