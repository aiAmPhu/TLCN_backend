import express from "express";
import {
    addUser,
    getAllUsers,
    updateUser,
    deleteUser,
    sendOTP,
    verifyOTP,
    changePassword,
    sendOTPForReset,
    resetPassword,
    // addUserNoOTP,
} from "../controllers/userController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", addUser);
// router.post("/addNoOTP", addUserNoOTP);
router.get("/getall", authenticate, authorizeRoles("admin", "reviewer"), getAllUsers);
router.put("/update/:userId", authenticate, authorizeRoles("user", "admin"), updateUser);
router.put("/changePassword/:userId", authenticate, authorizeRoles("user", "admin"), changePassword);
router.delete("/delete/:userId", authenticate, authorizeRoles("user", "admin"), deleteUser); // Cần chỉnh lại role
router.post("/sendOTP", sendOTP);
router.post("/verifyOTP", verifyOTP);
router.post("/send-otp-reset", sendOTPForReset);
router.post("/reset-password", resetPassword);
export default router;
