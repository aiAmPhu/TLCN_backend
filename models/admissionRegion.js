import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; // Import kết nối MySQL

const AdmissionRegion = sequelize.define(
    "AdmissionRegion",
    {
        regionId: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        regionName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        regionScored: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
    },
    {
        tableName: "admission_regions",
        timestamps: false,
    }
);

export default AdmissionRegion;
