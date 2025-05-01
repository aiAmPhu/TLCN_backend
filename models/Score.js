import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Subject from "./Subject.js";
import Transcript from "./Transcript.js";

const Score = sequelize.define(
    "Score",
    {
        scId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        subjectId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Subject,
                key: "suId",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        transcriptId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Transcript,
                key: "tId",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        year: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        score1: {
            type: DataTypes.FLOAT,
            allowNull: true,
            validate: {
                min: 0,
                max: 10,
            },
        },
        score2: {
            type: DataTypes.FLOAT,
            allowNull: true,
            validate: {
                min: 0,
                max: 10,
            },
        },
    },
    {
        tableName: "scores",
        timestamps: false,
    }
);

export default Score;
