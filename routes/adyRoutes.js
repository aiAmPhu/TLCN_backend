import express from "express";
import {
    addAdYear,
    deleteAdYear,
    getAllAdYears,
    updateAdYear,
    //getAllYearMajors,
} from "../controllers/adyController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("admin"), addAdYear);
router.get("/getAll", authenticate, authorizeRoles("admin"), getAllAdYears);
router.put("/update/:yearId", authenticate, authorizeRoles("admin"), updateAdYear);
router.delete("/delete/:yearId", authenticate, authorizeRoles("admin"), deleteAdYear);
//router.get("/getallYM", getAllYearMajors);
export default router;
