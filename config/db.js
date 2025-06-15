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

    // Try to get current API context (if available)
    const stack = new Error().stack;
    let apiEndpoint = "unknown";

    // Simple pattern matching for common routes
    if (stack.includes("userRoutes")) apiEndpoint = "/api/users/*";
    else if (stack.includes("admRoutes")) apiEndpoint = "/api/adms/*";
    else if (stack.includes("jwtRoutes")) apiEndpoint = "/api/jwt/*";
    else if (stack.includes("uploadRoutes")) apiEndpoint = "/api/upload/*";
    else if (stack.includes("authenticate")) apiEndpoint = "server-startup";
    else if (stack.includes("sync")) apiEndpoint = "database-sync";

    const connectionInfo = {
        id: totalConnections,
        timestamp,
        action: "CONNECT",
        active: activeConnections,
        max: sequelize.options.pool.max,
        apiEndpoint,
        duration: null, // Will be set on disconnect
    };

    connectionHistory.push(connectionInfo);

    console.log(` [${timestamp}] DB CONNECT #${totalConnections} (${apiEndpoint})`);
    console.log(`   └─ Active: ${activeConnections}/${sequelize.options.pool.max}`);

    // Keep connection reference for duration tracking
    connection._connectionStart = Date.now();
    connection._connectionId = totalConnections;
    connection._apiEndpoint = apiEndpoint;

    // Keep only last 50 connection events
    if (connectionHistory.length > 50) {
        connectionHistory = connectionHistory.slice(-50);
    }
});

// Enhanced disconnection tracking
sequelize.addHook("beforeDisconnect", (connection) => {
    const connectionDuration = connection._connectionStart ? Date.now() - connection._connectionStart : 0;

    activeConnections = Math.max(0, activeConnections - 1);

    const timestamp = new Date().toISOString();
    const connectionInfo = {
        timestamp,
        action: "DISCONNECT",
        active: activeConnections,
        max: sequelize.options.pool.max,
        apiEndpoint: connection._apiEndpoint || "unknown",
        duration: connectionDuration,
        connectionId: connection._connectionId,
    };

    connectionHistory.push(connectionInfo);

    console.log(
        ` [${timestamp}] DB DISCONNECT #${connection._connectionId || "?"} (${connection._apiEndpoint || "unknown"})`
    );
    console.log(`   ├─ Duration: ${connectionDuration}ms`);
    console.log(`   └─ Active: ${activeConnections}/${sequelize.options.pool.max}`);

    if (connectionHistory.length > 50) {
        connectionHistory = connectionHistory.slice(-50);
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

export default sequelize;
