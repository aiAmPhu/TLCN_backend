import express from "express";
import { updatePermission, deletePermission } from "../controllers/permissionController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Update user permissions
router.put("/update/:userId", verifyToken, updatePermission);

// Delete user permissions
router.delete("/delete/:userId", verifyToken, deletePermission);

export default router; 