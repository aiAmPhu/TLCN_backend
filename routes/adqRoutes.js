import express from "express";
import {
    addAdQuantity,
    getAllAdQuantities,
    updateAdQuantity,
    deleteAdQuantity,
    getQuantityByCriteriaIdAndMajorId,
} from "../controllers/adqController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("admin"), addAdQuantity);
router.get("/getall", authenticate, authorizeRoles("admin"), getAllAdQuantities);
router.put("/update/:id", authenticate, authorizeRoles("admin"), updateAdQuantity);
router.delete("/delete/:id", authenticate, authorizeRoles("admin"), deleteAdQuantity);
router.get(
    "/getQuantityByCriteriaIdAndMajorId/:criteriaId/:majorId",
    authenticate,
    authorizeRoles("admin"),
    getQuantityByCriteriaIdAndMajorId
);

export default router;
