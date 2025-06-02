import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; // Import kết nối DB

const User = sequelize.define(
    "User",
    {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        name: { type: DataTypes.STRING, allowNull: true },
        email: { type: DataTypes.STRING, allowNull: true },
        password: { type: DataTypes.STRING, allowNull: true },
        role: { type: DataTypes.STRING, allowNull: true },
        majorGroup: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },
    },
    {
        tableName: "users", // Tên bảng trong MySQL
        timestamps: false, // Tự động tạo createdAt & updatedAt
    }
);

export default User;
