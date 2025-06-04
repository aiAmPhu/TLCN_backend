import app from "./app.js";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import { createServer } from "http";
import { initializeSocket } from "./services/socketService.js";

dotenv.config();
const PORT = process.env.PORT || 8080;

// Cấu hình CORS
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

const syncDB = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log("✅ Database synchronized successfully");

        // Create HTTP server
        const server = createServer(app);

        // Initialize Socket.IO
        const io = initializeSocket(server);
        console.log("✅ Socket.IO initialized successfully");

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🔌 Socket.IO server is ready`);
        });
    } catch (error) {
        console.error("❌ Error syncing database:", error.message);
        process.exit(1);
    }
};

syncDB();
