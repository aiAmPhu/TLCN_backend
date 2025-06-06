import express from "express";
import { addAdRegion, deleteAdRegion, getAllAdRegions, updateAdRegion } from "../controllers/adrController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();



router.post("/add", authenticate, authorizeRoles("admin"), addAdRegion);
router.get("/getall", authenticate, getAllAdRegions); // Removed admin role requirement for reading
router.put("/update/:id", authenticate, authorizeRoles("admin"), updateAdRegion);
router.delete("/delete/:id", authenticate, authorizeRoles("admin"), deleteAdRegion);
export default router;
