import app from "./app.js";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import { updateAdYearStatus, scheduleAdYearStatusUpdate } from "./controllers/adyController.js";
import { createServer } from 'http';
import { initializeSocket } from './services/socketService.js';

dotenv.config();
const PORT = process.env.PORT || 8080;
app.use(cors());

const syncDB = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log("✅ Database synchronized successfully");
        scheduleAdYearStatusUpdate();
        
        // Create HTTP server
        const server = createServer(app);
        
        // Initialize Socket.IO
        initializeSocket(server);
        
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error syncing database:", error.message);
        process.exit(1);
    }
};

syncDB();