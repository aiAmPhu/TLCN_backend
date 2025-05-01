import express from "express";
import {
    addTranscript,
    getAllTranscripts,
    updateTranscript,
    getTranscriptStatusByUserId,
    getTranscriptByUserId,
    acceptTranscript,
    rejectTranscript,
    getAverageScoreByUserIDAndSubject,
} from "../controllers/transcriptController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("user"), addTranscript);
router.get("/getAll", authenticate, authorizeRoles("reviewer"), getAllTranscripts);
router.put("/accept/:userId", authenticate, authorizeRoles("reviewer"), acceptTranscript);
router.put("/reject/:userId", authenticate, authorizeRoles("reviewer"), rejectTranscript);
router.put("/update/:userId", authenticate, authorizeRoles("user"), updateTranscript);
router.get("/getStatus/:userId", authenticate, authorizeRoles("reviewer"), getTranscriptStatusByUserId);
router.get("/getTranscriptByE/:userId", authenticate, authorizeRoles("user", "reviewer"), getTranscriptByUserId);
router.get(
    "/getScoreByUIDandSubject/:userId/:subjectName",
    authenticate,
    authorizeRoles("admin"),
    getAverageScoreByUserIDAndSubject
); // Cần chỉnh lại role
export default router;
