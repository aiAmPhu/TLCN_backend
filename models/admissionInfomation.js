import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; // Import kết nối DB
import User from "./user.js";
const AdmissionInformation = sequelize.define(
    "AdmissionInformation",
    {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true, // Đặt làm khóa chính
            references: {
                model: User, // Bảng liên kết
                key: "userId", // Trường của bảng User tham chiếu tới
            },
            onDelete: "CASCADE", // Nếu User bị xóa thì xóa luôn dữ liệu liên quan
        },
        firstName: { type: DataTypes.STRING, allowNull: true },
        lastName: { type: DataTypes.STRING, allowNull: true },
        birthDate: { type: DataTypes.DATE, allowNull: true },
        gender: { type: DataTypes.STRING, allowNull: true },
        birthPlace: { type: DataTypes.STRING, allowNull: true },
        phone: { type: DataTypes.STRING, allowNull: true },
        email: { type: DataTypes.STRING, allowNull: false },
        parentEmail: { type: DataTypes.STRING, allowNull: true },
        idNumber: { type: DataTypes.STRING, allowNull: true },
        idIssueDate: { type: DataTypes.DATE, allowNull: true },
        idIssuePlace: { type: DataTypes.STRING, allowNull: true },
        province: { type: DataTypes.STRING, allowNull: true },
        district: { type: DataTypes.STRING, allowNull: true },
        commune: { type: DataTypes.STRING, allowNull: true },
        address: { type: DataTypes.STRING, allowNull: true },
        houseNumber: { type: DataTypes.STRING, allowNull: true },
        streetName: { type: DataTypes.STRING, allowNull: true },
        status: { type: DataTypes.STRING, allowNull: true, defaultValue: "waiting" },
        feedback: { type: DataTypes.STRING, allowNull: true },
    },
    {
        tableName: "admission_informations", // Tên bảng trong MySQL
        timestamps: false, // Không cần createdAt và updatedAt
    }
);
// Thiết lập quan hệ One-to-One giữa User và AdmissionInformation
User.hasOne(AdmissionInformation, { foreignKey: "userId" }); // Một User có một LearningProcess
AdmissionInformation.belongsTo(User, { foreignKey: "userId" }); // LearningProcess thuộc về một User
export default AdmissionInformation;
