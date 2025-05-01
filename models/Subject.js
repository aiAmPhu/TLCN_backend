import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Subject = sequelize.define(
    "Subject",
    {
        suId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: "subjects",
        timestamps: false,
    }
);

export default Subject;
