import express from "express";
import {
    addAdObject,
    deleteAdObject,
    getAllAdObjects,
    updateAdObject,
    getScoreByID,
} from "../controllers/adoController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("admin"), addAdObject);
router.get("/getall", authenticate, authorizeRoles("admin"), getAllAdObjects);
router.get("/getScoreByID/:id", authenticate, authorizeRoles("admin", "user"), getScoreByID);
router.put("/update/:id", authenticate, authorizeRoles("admin"), updateAdObject);
router.delete("/delete/:id", authenticate, authorizeRoles("admin"), deleteAdObject);
export default router;
