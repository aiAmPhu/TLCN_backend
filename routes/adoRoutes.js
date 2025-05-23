import express from "express";
import { addAdObject, deleteAdObject, getAllAdObjects, updateAdObject } from "../controllers/adoController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("admin"), addAdObject);
router.get("/getall", authenticate, authorizeRoles("admin"), getAllAdObjects);
router.put("/update/:id", authenticate, authorizeRoles("admin"), updateAdObject);
router.delete("/delete/:id", authenticate, authorizeRoles("admin"), deleteAdObject);
export default router;
