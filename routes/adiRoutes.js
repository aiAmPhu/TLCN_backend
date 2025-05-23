import express from "express";
import {
    addAdInformation,
    updateAdInformation,
    getAllAdInformation,
    getAdmissionInformationByID,
    acceptAdInformation,
    rejectAdInformation,
    getBasicAdmissionInfo,
} from "../controllers/adiController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("user", "admin"), addAdInformation);
router.put("/update/:id", authenticate, authorizeRoles("user", "admin"), updateAdInformation);
router.put("/accept/:id", authenticate, authorizeRoles("reviewer", "admin"), acceptAdInformation);
router.put("/reject/:id", authenticate, authorizeRoles("reviewer", "admin"), rejectAdInformation);
router.get("/getall", authenticate, authorizeRoles("reviewer", "admin"), getAllAdInformation);
router.get("/getAdi/:id", authenticate, authorizeRoles("reviewer", "user", "admin"), getAdmissionInformationByID);
router.get("/getBasicInfo/:id", authenticate, authorizeRoles("user", "admin"), getBasicAdmissionInfo);
export default router;
