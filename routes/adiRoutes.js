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

router.post("/add", authenticate, authorizeRoles("user"), addAdInformation);
router.put("/update/:id", authenticate, authorizeRoles("user"), updateAdInformation);
router.put("/accept/:id", authenticate, authorizeRoles("reviewer"), acceptAdInformation);
router.put("/reject/:id", authenticate, authorizeRoles("reviewer"), rejectAdInformation);
router.get("/getall", authenticate, authorizeRoles("reviewer"), getAllAdInformation);
router.get("/getAdi/:id", authenticate, authorizeRoles("reviewer", "user"), getAdmissionInformationByID);
router.get("/getBasicInfo/:id", authenticate, authorizeRoles("user"), getBasicAdmissionInfo);
export default router;
