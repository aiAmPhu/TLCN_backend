import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import AdmissionBlock from "./admissionBlock.js";
import AdmissionCriteria from "./admissionCriteria.js";
import AdmissionMajor from "./admissionMajor.js";
import User from "./user.js"; // Import model User

const AdmissionWishes = sequelize.define(
    "AdmissionWishes",
    {
        wishId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        priority: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        criteriaId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: AdmissionCriteria, // Liên kết với bảng admission_criteria
                key: "criteriaId",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        admissionBlockId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: AdmissionBlock, // Liên kết với bảng admission_blocks
                key: "admissionBlockId",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        majorId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: AdmissionMajor, // Liên kết với bảng admission_majors
                key: "majorId",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        uId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: User, // Liên kết với bảng users
                key: "userId",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        scores: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "waiting",
        },
    },
    {
        tableName: "admission_wishes", // Tên bảng trong MySQL
        timestamps: false, // Không cần createdAt và updatedAtrs
        indexes: [
            {
                unique: true,
                fields: ["criteriaId", "majorId", "uId"],
            },
        ],
    }
);

AdmissionWishes.belongsTo(AdmissionCriteria, { foreignKey: "criteriaId" });
AdmissionWishes.belongsTo(AdmissionBlock, { foreignKey: "admissionBlockId" });
AdmissionWishes.belongsTo(AdmissionMajor, { foreignKey: "majorId" });
AdmissionWishes.belongsTo(User, {
    foreignKey: "uId",
    targetKey: "userId",
});
export default AdmissionWishes;
