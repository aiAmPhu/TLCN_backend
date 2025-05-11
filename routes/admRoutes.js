import express from "express";
import {
    addAdMajor,
    deleteAdMajor,
    getAllAdMajors,
    getMajorByID,
    updateAdMajor,
    getMajorCombinationByID,
} from "../controllers/admController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("admin"), addAdMajor);
router.get("/getall", getAllAdMajors);
router.get("/getMajorByID/:id", getMajorByID);
router.get("/getCombination/:id", authenticate, authorizeRoles("admin", "user"), getMajorCombinationByID);
router.put("/update/:id", authenticate, authorizeRoles("admin"), updateAdMajor);
router.delete("/delete/:id", authenticate, authorizeRoles("admin"), deleteAdMajor);
export default router;
