import app from "./app.js";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import { createServer } from "http";
import { initializeSocket } from "./services/socketService.js";

dotenv.config();

// Environment debug info for Heroku
if (process.env.DYNO) {
    console.log(" Heroku Environment Detected");
    console.log(" Environment Info:", {
        nodeVersion: process.version,
        nodeEnv: process.env.NODE_ENV,
        dyno: process.env.DYNO,
        chromeBin: process.env.GOOGLE_CHROME_BIN || "Not set",
        port: process.env.PORT,
    });

    // Check if Chrome is available
    try {
        import("child_process")
            .then(({ execSync }) => {
                const chromePath = execSync(
                    'which google-chrome-stable 2>/dev/null || which chromium-browser 2>/dev/null || echo "not found"',
                    { encoding: "utf8" }
                ).trim();
                console.log("🌐 Chrome binary check:", chromePath);
            })
            .catch((err) => {
                console.log("⚠️ Chrome check error:", err.message);
            });
    } catch (error) {
        console.log("⚠️ Chrome check failed:", error.message);
    }
}

const PORT = process.env.PORT || 8080;

const syncDB = async () => {
    try {
        console.log(" Starting SAFE server initialization...");

        await sequelize.authenticate();
        console.log(" Database connection established");

        await sequelize.sync({ force: false, alter: false });
        console.log(" Database tables verified");

        const server = createServer(app);

        // Lightweight Socket.IO (0-1 connections)
        try {
            initializeSocket(server);
            console.log(" Socket.IO initialized");
        } catch (socketError) {
            console.warn(" Socket.IO failed:", socketError.message);
        }

        server.listen(PORT, () => {
            console.log(` SAFE server running on port ${PORT}`);
        });

        // ... graceful shutdown ...
    } catch (error) {
        console.error(" Safe server failed:", error.message);
        process.exit(1);
    }
};

syncDB();
