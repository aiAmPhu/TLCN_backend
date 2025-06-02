import express from "express";
import {
    addAdmissionWish,
    getAllWishesByUID,
    getAcceptedWish,
    filterAdmissionResults,
    resetAllWishesStatus,
    getFilteredAccepted,
    getFilterOptions,
} from "../controllers/adwController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("user", "admin"), addAdmissionWish);
router.get("/getAll/:uId", authenticate, authorizeRoles("user"), getAllWishesByUID);
router.get("/getAccepted", authenticate, authorizeRoles("admin"), getAcceptedWish);
router.put("/filter", authenticate, authorizeRoles("admin"), filterAdmissionResults);
router.put("/resetStatus", resetAllWishesStatus);
router.get("/getFilteredAccepted", authenticate, authorizeRoles("admin"), getFilteredAccepted);
router.get("/getFilterOptions", authenticate, authorizeRoles("admin"), getFilterOptions);
export default router;
