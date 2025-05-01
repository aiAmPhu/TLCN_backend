import express from "express";
import {
    addAdBlock,
    getAllAdBlocks,
    updateAdBlock,
    deleteAdBlock,
    getAllSubjectsByAdmissionBlockId,
} from "../controllers/adbController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("admin"), addAdBlock);
router.get("/getall", authenticate, authorizeRoles("admin"), getAllAdBlocks);
router.get("/getSubjects/:admissionBlockId", authenticate, authorizeRoles("admin"), getAllSubjectsByAdmissionBlockId);
router.put("/update/:id", authenticate, authorizeRoles("admin"), updateAdBlock);
router.delete("/delete/:id", authenticate, authorizeRoles("admin"), deleteAdBlock);
export default router;
