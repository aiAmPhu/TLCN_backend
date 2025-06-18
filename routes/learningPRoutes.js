import express from "express";
import {
    addLearningProcess,
    getAllLearningProcess,
    updateLearningProcess,
    getLearningProcessByUID,
    acceptLearningProcess,
    rejectLearningProcess,
} from "../controllers/learningProcessController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("user"), addLearningProcess);
router.put("/update/:userId", authenticate, authorizeRoles("user", "admin"), updateLearningProcess);
router.put("/accept/:userId", authenticate, authorizeRoles("reviewer"), acceptLearningProcess);
router.put("/reject/:userId", authenticate, authorizeRoles("reviewer"), rejectLearningProcess);
router.get("/getall", authenticate, authorizeRoles("reviewer"), getAllLearningProcess);
router.get("/getLPByE/:userId", authenticate, authorizeRoles("reviewer", "user"), getLearningProcessByUID);
export default router;
