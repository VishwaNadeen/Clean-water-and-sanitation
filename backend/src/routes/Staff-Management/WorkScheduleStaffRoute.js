import express from "express";
import {
  getMySchedules,
  startWork,
  uploadProof,
  completeWork,
} from "../../controllers/Staff-Management/WorkScheduleStaffCtrl.js";

import upload from "../../middleware/StaffUploadImg.js";
import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Staff only
router.get("/me", protect, authorizeRoles("STAFF"), getMySchedules);
router.patch("/:id/start", protect, authorizeRoles("STAFF"), startWork);
router.post("/:id/proof", protect, authorizeRoles("STAFF"), upload.single("proof"), uploadProof);
router.patch("/:id/complete", protect, authorizeRoles("STAFF"), completeWork);

export default router;