import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; // Import kết nối DB

const AdmissionObject = sequelize.define(
    "admission_object",
    {
        objectId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true, // Đặt làm khóa chính
        },
        objectName: { type: DataTypes.STRING, allowNull: false },
        objectScored: { type: DataTypes.FLOAT, allowNull: false },
        objectDescription: { type: DataTypes.TEXT, allowNull: false },
    },
    {
        timestamps: false, // Tự động thêm createdAt & updatedAt
    }
);

export default AdmissionObject;
