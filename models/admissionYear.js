import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const AdYear = sequelize.define(
    "AdYear",
    {
        yearId: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: true,
        },
        yearName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "admission_years",
        timestamps: false,
    }
);

export default AdYear;
