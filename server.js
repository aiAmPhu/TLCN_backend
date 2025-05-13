import app from "./app.js";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js"; // Import kết nối MySQL
import { updateAdYearStatus, scheduleAdYearStatusUpdate } from "./controllers/adyController.js"; // Import hàm lên lịch cập nhật trạng thái AdYear

dotenv.config();
const PORT = process.env.PORT || 8080;
app.use(cors());

const syncDB = async () => {
    try {
        await sequelize.sync({ alter: true }); // Cập nhật thay đổi
        console.log("✅ Database synchronized successfully");
        // await updateAdYearStatus();
        // console.log("✅ Completed initial AdYear status update");
        scheduleAdYearStatusUpdate();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error syncing database:", error.message);
        process.exit(1);
    }
};
syncDB();
