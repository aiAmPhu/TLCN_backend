import express from "express";
import {
    createAdmissionYear,
    getAllAdmissionYears,
    activateAdmissionYear,
    configureAdmissionYear,
    getAdmissionYearConfig,
    getActiveYearOptions,
    compareYears,
    getYearStatistics,
} from "../controllers/adyController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authenticate, authorizeRoles("admin"), createAdmissionYear);
router.get("/getAll", authenticate, authorizeRoles("admin"), getAllAdmissionYears);
router.put("/activate/:yearId", authenticate, authorizeRoles("admin"), activateAdmissionYear);
router.post("/configure/:yearId", authenticate, authorizeRoles("admin"), configureAdmissionYear);
router.get("/config/:yearId", authenticate, authorizeRoles("admin"), getAdmissionYearConfig);
router.get("/activeOptions", authenticate, getActiveYearOptions);
router.get("/compare", authenticate, authorizeRoles("admin"), compareYears);
router.get("/statistics/:yearId", authenticate, authorizeRoles("admin"), getYearStatistics);

export default router;
