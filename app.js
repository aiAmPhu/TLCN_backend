import express from "express";
import dotenv from "dotenv";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adbRoutes from "./routes/adbRoutes.js";
import admRoutes from "./routes/admRoutes.js";
import yearRoutes from "./routes/adyRoutes.js";
import adcRoutes from "./routes/adcRoutes.js";
import adrRoutes from "./routes/adrRoutes.js";
import adoRoutes from "./routes/adoRoutes.js";
import adqRoutes from "./routes/adqRoutes.js";
import jwtRoutes from "./routes/jwtRoutes.js";
import adiRoutes from "./routes/adiRoutes.js";
import photoRoutes from "./routes/photoRoutes.js";
import learningPRoutes from "./routes/learningPRoutes.js";
import cors from "cors";
import transcriptRoutes from "./routes/transcriptRoutes.js";
import adwRoutes from "./routes/adwRoutes.js";
import permissionRoutes from "./routes/permissionRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import statisticsSnapshotRoutes from "./routes/statisticsSnapshotRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import passport from "./config/passport.js";

dotenv.config();
//connectDB();

const app = express();
// app.use(cors());
app.use(
    cors({
        origin: [
            "https://tuyensinhute.admute.me",
            "http://localhost:3000",
            "http://localhost:5173",
            "https://kltn-frontend-git-thienphu-pham-le-thien-phus-projects.vercel.app",
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
        optionsSuccessStatus: 200,
    })
);
app.options("*", (req, res) => {
    const allowedOrigins = [
        "https://tuyensinhute.admute.me",
        "https://kltn-frontend-git-thienphu-pham-le-thien-phus-projects.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS,PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    res.status(200).end();
});

app.use(express.json());
app.use((req, res, next) => {
    // Tăng timeout cho route filter
    if (req.path.includes("/filter")) {
        req.setTimeout(600000); // 10 phút
        res.setTimeout(600000); // 10 phút
    }
    next();
});
app.use((req, res, next) => {
    // Tăng timeout cho route filter
    if (req.path.includes("/create-yearly")) {
        req.setTimeout(600000); // 10 phút
        res.setTimeout(600000); // 10 phút
    }
    next();
});
app.use((req, res, next) => {
    // Tăng timeout cho route filter
    if (req.path.includes("/create")) {
        req.setTimeout(600000); // 10 phút
        res.setTimeout(600000); // 10 phút
    }
    next();
});
app.use(passport.initialize());
app.use("/api", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/adbs", adbRoutes);
app.use("/api/adms", admRoutes);
app.use("/api/admissionYear", yearRoutes);
app.use("/api/adcs", adcRoutes);
app.use("/api/adrs", adrRoutes);
app.use("/api/ados", adoRoutes);
app.use("/api/adqs", adqRoutes);
app.use("/api/adis", adiRoutes);
app.use("/api/learning", learningPRoutes);
app.use("/api/photo", photoRoutes);
app.use("/api/jwt", jwtRoutes);
app.use("/api/transcripts", transcriptRoutes);
app.use("/api/wish", adwRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/snapshots", statisticsSnapshotRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/announcements", announcementRoutes);

export default app;
