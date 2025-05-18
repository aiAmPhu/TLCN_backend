import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js"; // Import bảng User để tạo quan hệ

const PhotoID = sequelize.define(
    "PhotoID",
    {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true, // userId là khóa chính
            allowNull: false,
            references: {
                model: User, // Tham chiếu đến bảng User
                key: "userId",
            },
            onDelete: "CASCADE", // Nếu user bị xóa thì xóa luôn ảnh
            onUpdate: "CASCADE",
        },
        personalPic: { type: DataTypes.STRING, allowNull: true },
        birthCertificate: { type: DataTypes.STRING, allowNull: true },
        frontCCCD: { type: DataTypes.STRING, allowNull: true },
        backCCCD: { type: DataTypes.STRING, allowNull: true },
        grade10Pic: { type: DataTypes.STRING, allowNull: true },
        grade11Pic: { type: DataTypes.STRING, allowNull: true },
        grade12Pic: { type: DataTypes.STRING, allowNull: true },
        status: { type: DataTypes.STRING, allowNull: true },
        feedback: { type: DataTypes.STRING, allowNull: true },
    },
    {
        tableName: "photos",
        timestamps: false, // Không cần createdAt & updatedAt
    }
);

PhotoID.belongsTo(User, { foreignKey: "userId" });
export default PhotoID;
