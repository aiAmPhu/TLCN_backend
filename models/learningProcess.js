import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js"; // Import model User
import AdmissionObject from "./admissionObject.js"; // Import model AdmissionObject

const LearningProcess = sequelize.define(
    "learning_process",
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
        grade10_province: { type: DataTypes.STRING, allowNull: false },
        grade10_district: { type: DataTypes.STRING, allowNull: false },
        grade10_school: { type: DataTypes.STRING, allowNull: false },
        grade11_province: { type: DataTypes.STRING, allowNull: false },
        grade11_district: { type: DataTypes.STRING, allowNull: false },
        grade11_school: { type: DataTypes.STRING, allowNull: false },
        grade10_province: { type: DataTypes.STRING, allowNull: false },
        grade12_district: { type: DataTypes.STRING, allowNull: false },
        grade12_school: { type: DataTypes.STRING, allowNull: false },
        graduationYear: { type: DataTypes.STRING, allowNull: false },
        priorityGroup: {
            type: DataTypes.STRING,
            allowNull: true,
            references: {
                model: AdmissionObject, // Tham chiếu đến bảng `admission_object`
                key: "objectId",
            },
            onUpdate: "CASCADE", // Cập nhật tự động khi khóa chính thay đổi
            onDelete: "SET DEFAULT", // Nếu `objectId` bị xóa thì đặt giá trị NULL
        },
        status: { type: DataTypes.STRING, allowNull: false },
        feedback: { type: DataTypes.STRING, allowNull: true },
    },
    {
        timestamps: false, // Tự động thêm createdAt & updatedAt
    }
);

LearningProcess.belongsTo(User, { foreignKey: "userId" });
LearningProcess.belongsTo(AdmissionObject, { foreignKey: "priorityGroup" });
export default LearningProcess;
