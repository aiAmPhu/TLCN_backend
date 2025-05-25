import express from "express";
import {
    addLearningProcess,
    getAllLearningProcess,
    updateLearningProcess,
    deleteLearningProcess,
    getLearningProcessStatusByUID,
    getLearningProcessByUID,
    acceptLearningProcess,
    rejectLearningProcess,
    getPriorityGroupStatusByUID,
} from "../controllers/learningProcessController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("user"), addLearningProcess);
router.put("/update/:userId", authenticate, authorizeRoles("user"), updateLearningProcess);
router.delete("/delete/:userId", authenticate, authorizeRoles("admin"), deleteLearningProcess); // Cần chỉnh role
router.put("/accept/:userId", authenticate, authorizeRoles("reviewer"), acceptLearningProcess);
router.put("/reject/:userId", authenticate, authorizeRoles("reviewer"), rejectLearningProcess);
router.get("/getall", authenticate, authorizeRoles("reviewer"), getAllLearningProcess);
router.get("/getStatus/:userId", authenticate, authorizeRoles("reviewer"), getLearningProcessStatusByUID);
router.get("/getPriorityGroup/:userId", authenticate, authorizeRoles("reviewer"), getPriorityGroupStatusByUID);
router.get("/getLPByE/:userId", authenticate, authorizeRoles("reviewer", "user"), getLearningProcessByUID);
export default router;
