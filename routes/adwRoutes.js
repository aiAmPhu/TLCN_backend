import express from "express";
import {
    addAdmissionWish,
    getAllWishesByUID,
    getAcceptedWish,
    filterAdmissionResults,
    resetAllWishesStatus,
    getFilteredAccepted,
    getFilterOptions,
    getWishFormData,
    getAllYears,
} from "../controllers/adwController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";
import AdmissionWishes from "../models/admissionWishes.js";

const router = express.Router();

// Temporary route to sync database schema - REMOVE after use
router.get("/sync-db", async (req, res) => {
    try {
        await AdmissionWishes.sync({ alter: true });
        res.json({ message: "Database schema updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error syncing database", error: error.message });
    }
});

router.post("/add", authenticate, authorizeRoles("user", "admin"), addAdmissionWish);
router.get("/getAll/:uId", authenticate, authorizeRoles("user"), getAllWishesByUID);
router.get("/getAccepted", authenticate, authorizeRoles("admin"), getAcceptedWish);
router.put("/filter", authenticate, authorizeRoles("admin"), filterAdmissionResults);
router.put("/resetStatus", resetAllWishesStatus);
router.get("/getFilteredAccepted", authenticate, authorizeRoles("admin"), getFilteredAccepted);
router.get("/getFilterOptions", authenticate, authorizeRoles("admin"), getFilterOptions);
router.get("/form-data", authenticate, authorizeRoles("user", "admin"), getWishFormData);
router.get("/years", authenticate, authorizeRoles("user", "admin"), getAllYears);
export default router;
