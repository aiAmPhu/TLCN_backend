import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const AdmissionYear = sequelize.define(
    "AdmissionYear",
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
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "admission_years",
        timestamps: false,
    }
);

export default AdmissionYear;
