import express from "express";
import {
    addPhotoID,
    updatePhotoID,
    getAllPhotos,
    getPhotoStatusByUID,
    getPhotoByUID,
    acceptPhotoID,
    rejectPhotoID,
} from "../controllers/photoIDController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authenticate, authorizeRoles("user", "reviewer"), addPhotoID);
router.put("/update/:userId", authenticate, authorizeRoles("user"), updatePhotoID);
router.get("/getall", authenticate, authorizeRoles("reviewer"), getAllPhotos);
router.put("/accept/:userId", authenticate, authorizeRoles("reviewer"), acceptPhotoID);
router.put("/reject/:userId", authenticate, authorizeRoles("reviewer"), rejectPhotoID);
router.get("/getStatus/:userId", authenticate, authorizeRoles("reviewer"), getPhotoStatusByUID);
router.get("/getPhoto/:userId", authenticate, authorizeRoles("reviewer", "user"), getPhotoByUID);
export default router;
