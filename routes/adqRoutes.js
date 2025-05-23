import express from "express";
import { addAdQuantity, getAllAdQuantities, updateAdQuantity, deleteAdQuantity } from "../controllers/adqController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("admin"), addAdQuantity);
router.get("/getall", authenticate, authorizeRoles("admin"), getAllAdQuantities);
router.put("/update", authenticate, authorizeRoles("admin"), updateAdQuantity);
router.delete("/delete", authenticate, authorizeRoles("admin"), deleteAdQuantity);

export default router;
