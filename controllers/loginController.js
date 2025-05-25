import User from "../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import * as loginService from "../services/loginService.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
export const tokenBlacklist = new Set();

export const loginFunction = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await loginService.login(email, password);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi hệ thống. Vui lòng thử lại sau.",
        });
    }
};

export const logoutFunction = (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    try {
        const result = loginService.logout(token, tokenBlacklist);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi hệ thống. Vui lòng thử lại sau.",
        });
    }
};
