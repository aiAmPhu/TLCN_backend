import Sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // Load biến môi trường từ .env

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql", // Đổi thành MySQL
    logging: false, // Ẩn log SQL nếu không cần
});

export default sequelize;
