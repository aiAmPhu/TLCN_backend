import express from "express";
import { addAdObject, deleteAdObject, getAllAdObjects, updateAdObject } from "../controllers/adoController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("admin", "admin"), addAdObject);
router.get("/getall", authenticate, authorizeRoles("admin", "admin"), getAllAdObjects);
router.put("/update/:id", authenticate, authorizeRoles("admin", "admin"), updateAdObject);
router.delete("/delete/:id", authenticate, authorizeRoles("admin", "admin"), deleteAdObject);
export default router;
