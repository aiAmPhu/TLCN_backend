import express from "express";
import {
    addAdBlock,
    getAllAdBlocks,
    updateAdBlock,
    deleteAdBlock,
    getAllSubjectsByAdmissionBlockId,
    exportAdBlocks,
    importAdBlocks
} from "../controllers/adbController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("admin"), addAdBlock);
router.get("/getall", getAllAdBlocks);
router.get("/getSubjects/:admissionBlockId", authenticate, authorizeRoles("admin"), getAllSubjectsByAdmissionBlockId);
router.put("/update/:id", authenticate, authorizeRoles("admin"), updateAdBlock);
router.delete("/delete/:id", authenticate, authorizeRoles("admin"), deleteAdBlock);
router.get("/export", authenticate, authorizeRoles("admin"), exportAdBlocks);
router.post("/import", authenticate, authorizeRoles("admin"), importAdBlocks);

export default router;
