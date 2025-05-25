import express from "express";
import {
    addPhotoID,
    updatePhotoID,
    getAllPhotos,
    getPhotoByUID,
    acceptPhotoID,
    rejectPhotoID,
} from "../controllers/photoIDController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("user", "reviewer", "admin"), addPhotoID);
router.put("/update/:userId", authenticate, authorizeRoles("user", "admin"), updatePhotoID);
router.get("/getall", authenticate, authorizeRoles("reviewer", "admin"), getAllPhotos);
router.put("/accept/:userId", authenticate, authorizeRoles("reviewer", "admin"), acceptPhotoID);
router.put("/reject/:userId", authenticate, authorizeRoles("reviewer", "admin"), rejectPhotoID);
router.get("/getPhoto/:userId", authenticate, authorizeRoles("reviewer", "user", "admin"), getPhotoByUID);
export default router;
