import express from "express";
import { loginFunction, logoutFunction } from "../controllers/loginController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginFunction);
router.post("/logout", authenticate, logoutFunction);

export default router;
