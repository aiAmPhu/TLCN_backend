import express from "express";
import { addAdCriteria, getAllAdCriterias, updateAdCriteria, deleteAdCriteria } from "../controllers/adcController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("admin"), addAdCriteria);
router.get("/getall", authenticate, authorizeRoles("admin"), getAllAdCriterias);
router.put("/update/:id", authenticate, authorizeRoles("admin"), updateAdCriteria);
router.delete("/delete/:id", authenticate, authorizeRoles("admin"), deleteAdCriteria);
export default router;
