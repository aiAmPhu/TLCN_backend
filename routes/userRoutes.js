import express from "express";
import {
    addUser,
    getAllUsers,
    updateUser,
    deleteUser,
    sendOTP,
    verifyOTP,
    // addUserNoOTP,
} from "../controllers/userController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", addUser);
// router.post("/addNoOTP", addUserNoOTP);
router.get("/getall", authenticate, authorizeRoles("admin"), getAllUsers);
router.put("/update/:userId", authenticate, authorizeRoles("user", "admin"), updateUser);
router.delete("/delete/:userId", authenticate, authorizeRoles("user", "admin"), deleteUser); // Cần chỉnh lại role
router.post("/sendOTP", sendOTP);
router.post("/verifyOTP", verifyOTP);
export default router;
