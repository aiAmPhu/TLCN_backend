import express from "express";
import {
    addAdmissionWish,
    // getHighestPriorityAdmissionWishByUID,
    getAllWishesByUID,
    //getAllUniqueEmails,
    getWishesByStatus,
    acceptWish,
    rejectWish,
    waitingtWish,
    getAcceptedWish,
    filterAdmissionResults,
    resetAllWishesStatus,
} from "../controllers/adwController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("user", "admin"), addAdmissionWish);
// router.get("/max/:uId", getHighestPriorityAdmissionWishByUID);
router.get("/getAll/:uId", authenticate, authorizeRoles("admin"), getAllWishesByUID);
//router.get("/getUniqueEmails", getAllUniqueEmails);
router.get("/getByStatus/:status", authenticate, authorizeRoles("admin"), getWishesByStatus);
router.put("/accept/:id", authenticate, authorizeRoles("admin"), acceptWish);
router.put("/reject/:id", authenticate, authorizeRoles("admin"), rejectWish);
router.put("/waiting/:id", authenticate, authorizeRoles("admin"), waitingtWish);
router.get("/getAccepted", authenticate, authorizeRoles("admin"), getAcceptedWish);
router.put("/filter", authenticate, authorizeRoles("admin"), filterAdmissionResults);
router.put("/resetStatus", authenticate, authorizeRoles("admin"), resetAllWishesStatus);
export default router;
