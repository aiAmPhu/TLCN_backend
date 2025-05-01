// import app from "./app.js";
// import cors from "cors";

// const PORT = process.env.PORT || 8080;
// app.use(cors());
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

import app from "./app.js";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js"; // Import kết nối MySQL

dotenv.config();

const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());

// Kết nối MySQL trước khi khởi động server
// const startServer = async () => {
//     try {
//         await sequelize.authenticate();
//         console.log("✅ Connected to MySQL database!");

//         await sequelize.sync({ alter: true }); // Đồng bộ model
//         console.log("✅ All models were synchronized successfully.");

//         app.listen(PORT, () => {
//             console.log(`🚀 Server running on port ${PORT}`);
//         });
//     } catch (error) {
//         console.error("❌ Unable to connect to the database:", error.message);
//         process.exit(1);
//     }
// };

// startServer();
const syncDB = async () => {
    try {
        await sequelize.sync({ alter: true }); // Cập nhật thay đổi
        console.log("✅ Database synchronized successfully");
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
        //process.exit(0);
    } catch (error) {
        console.error("❌ Error syncing database:", error.message);
        process.exit(1);
    }
};

syncDB();
