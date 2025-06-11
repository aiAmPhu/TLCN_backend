import Sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // Load biến môi trường từ .env

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql", // Đổi thành MySQL
    logging: false, // Ẩn log SQL nếu không cần
    //  CONNECTION POOL CONFIG
    pool: {
        max: 5, // Tối đa 5 kết nối (thay vì default 25)
        min: 1, // Tối thiểu 1 kết nối
        acquire: 30000, // Chờ 30 giây để lấy kết nối
        idle: 10000, // Đóng kết nối sau 10 giây không dùng
        evict: 1000, // Kiểm tra mỗi 1 giây
        handleDisconnects: true, // Tự động kết nối lại khi bị ngắt
    },
    //  TIMEOUT SETTINGS
    dialectOptions: {
        connectTimeout: 30000,
        acquireTimeout: 30000,
        timeout: 30000,
    },
});
export default sequelize;
