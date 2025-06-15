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
let totalConnections = 0;
let connectionHistory = [];

// Track connection creation
sequelize.addHook("afterConnect", (connection) => {
    activeConnections++;
    totalConnections++;

    const timestamp = new Date().toISOString();
    const connectionInfo = {
        id: totalConnections,
        timestamp,
        action: "CONNECT",
        active: activeConnections,
        max: sequelize.options.pool.max,
    };

    connectionHistory.push(connectionInfo);

    console.log(`📊 [${timestamp}] DB CONNECT #${totalConnections}`);
    console.log(`   └─ Active: ${activeConnections}/${sequelize.options.pool.max}`);

    // Keep only last 20 connection events
    if (connectionHistory.length > 20) {
        connectionHistory = connectionHistory.slice(-20);
    }
});

// Track connection closure
sequelize.addHook("beforeDisconnect", (connection) => {
    activeConnections = Math.max(0, activeConnections - 1);

    const timestamp = new Date().toISOString();
    const connectionInfo = {
        timestamp,
        action: "DISCONNECT",
        active: activeConnections,
        max: sequelize.options.pool.max,
    };

    connectionHistory.push(connectionInfo);

    console.log(`📊 [${timestamp}] DB DISCONNECT`);
    console.log(`   └─ Active: ${activeConnections}/${sequelize.options.pool.max}`);

    if (connectionHistory.length > 20) {
        connectionHistory = connectionHistory.slice(-20);
    }
});
//  CONNECTION STATS FUNCTION
export const getConnectionStats = () => {
    return {
        active: activeConnections,
        total: totalConnections,
        max: sequelize.options.pool.max,
        history: connectionHistory.slice(-10), // Last 10 events
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    };
};

//  PERIODIC CONNECTION REPORTING
setInterval(() => {
    if (activeConnections > 0) {
        console.log(` [${new Date().toISOString()}] Connection Status:`);
        console.log(`   └─ Active: ${activeConnections}/${sequelize.options.pool.max}`);
        console.log(`   └─ Total Created: ${totalConnections}`);
        console.log(`   └─ Uptime: ${Math.floor(process.uptime())}s`);
    }
}, 30000); // Every 30 seconds

export default sequelize;
