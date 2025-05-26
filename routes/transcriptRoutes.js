import express from "express";
import {
    addTranscript,
    getAllTranscripts,
    updateTranscript,
    getTranscriptByUserId,
    acceptTranscript,
    rejectTranscript,
} from "../controllers/transcriptController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("user", "admin"), addTranscript);
router.get("/getAll", authenticate, authorizeRoles("reviewer"), getAllTranscripts);
router.put("/accept/:userId", authenticate, authorizeRoles("reviewer"), acceptTranscript);
router.put("/reject/:userId", authenticate, authorizeRoles("reviewer"), rejectTranscript);
router.put("/update/:userId", authenticate, authorizeRoles("user"), updateTranscript);
router.get("/getTranscriptByE/:userId", authenticate, authorizeRoles("user", "reviewer"), getTranscriptByUserId);
export default router;
