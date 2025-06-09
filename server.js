import app from "./app.js";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import { createServer } from "http";
import { initializeSocket } from "./services/socketService.js";
import seedSubjects from "./scripts/seedSubjects.js";

dotenv.config();

// Environment debug info for Heroku
if (process.env.DYNO) {
    console.log('🔍 Heroku Environment Detected');
    console.log('📊 Environment Info:', {
        nodeVersion: process.version,
        nodeEnv: process.env.NODE_ENV,
        dyno: process.env.DYNO,
        chromeBin: process.env.GOOGLE_CHROME_BIN || 'Not set',
        port: process.env.PORT
    });
    
    // Check if Chrome is available
    try {
        import('child_process').then(({ execSync }) => {
            const chromePath = execSync('which google-chrome-stable 2>/dev/null || which chromium-browser 2>/dev/null || echo "not found"', { encoding: 'utf8' }).trim();
            console.log('🌐 Chrome binary check:', chromePath);
        }).catch(err => {
            console.log('⚠️ Chrome check error:', err.message);
        });
    } catch (error) {
        console.log('⚠️ Chrome check failed:', error.message);
    }
}

const PORT = process.env.PORT || 8080;

// Cấu hình CORS
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

const syncDB = async () => {
    try {
        console.log("🚀 Starting server initialization...");
        
        // Test database connection first
        await sequelize.authenticate();
        console.log("✅ Database connection has been established successfully");
        
        // Sync database
        await sequelize.sync({ alter: true });
        console.log("✅ Database synchronized successfully");

        // Seed initial data (non-blocking)
        try {
            await seedSubjects();
        } catch (seedError) {
            console.warn("⚠️ Warning: Failed to seed subjects, but server will continue:", seedError.message);
            // Don't throw here - let server continue even if seeding fails
        }

        // Create HTTP server
        const server = createServer(app);

        // Initialize Socket.IO
        try {
            const io = initializeSocket(server);
            console.log("✅ Socket.IO initialized successfully");
        } catch (socketError) {
            console.warn("⚠️ Warning: Socket.IO initialization failed:", socketError.message);
            // Continue without Socket.IO if it fails
        }

        server.listen(PORT, () => {
            console.log(`🎉 Server running successfully on port ${PORT}`);
            console.log(`🌐 API available at: http://localhost:${PORT}`);
            if (process.env.NODE_ENV === 'production') {
                console.log("🔧 Running in production mode");
            } else {
                console.log("🔧 Running in development mode");
            }
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('👋 SIGTERM received, shutting down gracefully');
            server.close(() => {
                console.log('💥 Process terminated');
                sequelize.close();
            });
        });

    } catch (error) {
        console.error("❌ Critical error during server initialization:", error.message);
        console.error("Full error details:", error);
        
        // In production, we might want to exit more gracefully
        if (process.env.NODE_ENV === 'production') {
            console.error("🚨 Production deployment failed - check database configuration");
        }
        
        process.exit(1);
    }
};
syncDB();
