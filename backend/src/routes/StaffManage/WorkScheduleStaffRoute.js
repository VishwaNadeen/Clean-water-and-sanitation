import express from "express";
import upload from "../../middleware/StaffuploadImg.js";
import {
  getMySchedules,
  startWork,
  uploadProof,
  completeWork,
} from "../../controllers/StaffManage/WorkScheduleStaffCtrl.js";

const router = express.Router();

// Staff endpoints
router.get("/me", getMySchedules);
router.patch("/:id/start", startWork);
router.post("/:id/proof", upload.single("proof"), uploadProof);
router.patch("/:id/complete", completeWork);

export default router;