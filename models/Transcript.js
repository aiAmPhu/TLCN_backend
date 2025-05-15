import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";

const Transcript = sequelize.define(
    "Transcript",
    {
        tId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User, // Giả sử userID tham chiếu đến bảng Users
                key: "userId",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        feedback: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "transcripts",
        timestamps: false,
    }
);

Transcript.belongsTo(User, { foreignKey: "userId" });

export default Transcript;
