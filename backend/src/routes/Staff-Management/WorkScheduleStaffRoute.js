import express from "express";
import {
  getMySchedules,
  startWork,
  revertStartWork,
  uploadProof,
  removeProof,
  reworkRejected,
  completeWork,
} from "../../controllers/Staff-Management/WorkScheduleStaffCtrl.js";

import upload from "../../middleware/StaffUploadImg.js";
import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Staff only
router.get("/me", protect, authorizeRoles("STAFF"), getMySchedules);
router.patch("/:id/start", protect, authorizeRoles("STAFF"), startWork);
router.patch("/:id/revert-start", protect, authorizeRoles("STAFF"), revertStartWork);
router.patch("/:id/rework", protect, authorizeRoles("STAFF"), reworkRejected);
router.post("/:id/proof", protect, authorizeRoles("STAFF"), upload.single("proof"), uploadProof);
router.delete("/:id/proof", protect, authorizeRoles("STAFF"), removeProof);
router.patch("/:id/complete", protect, authorizeRoles("STAFF"), completeWork);

export default router;
