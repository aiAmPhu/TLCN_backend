import express from "express";
import { loginFunction, protectedFunction } from "../controllers/loginController.js";

const router = express.Router();

router.post("/login", loginFunction);
router.get("/get", protectedFunction);

export default router;
