import express from "express";
import * as statisticsSnapshotController from "../controllers/statisticsSnapshotController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/create", authenticate, authorizeRoles("admin"), statisticsSnapshotController.createManualSnapshot);
router.post("/create-yearly", authenticate, authorizeRoles("admin"), statisticsSnapshotController.createYearlySnapshot);
router.get("/", authenticate, authorizeRoles("admin"), statisticsSnapshotController.getSnapshots);
router.get("/:snapshotId", authenticate, authorizeRoles("admin"), statisticsSnapshotController.getSnapshotById);
router.post("/compare", authenticate, authorizeRoles("admin"), statisticsSnapshotController.compareSnapshots);
router.delete("/:snapshotId", authenticate, authorizeRoles("admin"), statisticsSnapshotController.deleteSnapshot);

export default router;
