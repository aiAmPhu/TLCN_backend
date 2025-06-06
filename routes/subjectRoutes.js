import express from "express";
import { getAllSubjects, getSubjectById } from "../controllers/subjectController.js";

const router = express.Router();

// Route để lấy tất cả môn học
router.get("/", getAllSubjects);

// Route để lấy môn học theo ID  
router.get("/:id", getSubjectById);


export default router; 

