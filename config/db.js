import Sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // Load biến môi trường từ .env

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,

    pool: {
        max: 5,
        min: 1,
        acquire: 30000, //  Thời gian chờ lấy connection
        idle: 5000, // Giảm từ 10000 xuống 5000
        evict: 1000, //  Cleanup interval
        handleDisconnects: true, //  Auto reconnect
    },

    // Timeout settings
    dialectOptions: {
        connectTimeout: 20000,
        acquireTimeout: 20000,
        timeout: 20000,
        ssl:
            process.env.NODE_ENV === "production"
                ? {
                      require: true,
                      rejectUnauthorized: false,
                  }
                : false,
    },

    // Retry logic
    retry: {
        max: 3,
        timeout: 3000,
        match: [
            /ETIMEDOUT/,
            /EHOSTUNREACH/,
            /ECONNRESET/,
            /ECONNREFUSED/,
            /ER_USER_LIMIT_REACHED/,
            /SequelizeConnectionError/,
        ],
    },

    // Define settings
    define: {
        timestamps: false,
        freezeTableName: true,
    },
});

//Connection monitoring
let activeConnections = 0;

sequelize.addHook("afterConnect", () => {
    activeConnections++;
    console.log(` DB Connections: ${activeConnections}/${sequelize.options.pool.max}`);
});

sequelize.addHook("beforeDisconnect", () => {
    activeConnections--;
    console.log(` DB Connections: ${activeConnections}/${sequelize.options.pool.max}`);
});

export default sequelize;
