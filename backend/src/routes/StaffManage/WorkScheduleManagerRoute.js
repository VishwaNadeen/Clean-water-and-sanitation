import express from "express";
import {
  assignSchedule,
  listSchedules,
  editSchedule,
  cancelSchedule,
  approveSchedule,
  rejectSchedule,
} from "../../controllers/StaffManage/WorkScheduleManagerCtrl.js";

const router = express.Router();

// Manager endpoints
router.post("/", assignSchedule);
router.get("/", listSchedules);
router.put("/:id", editSchedule);
router.patch("/:id/cancel", cancelSchedule);
router.patch("/:id/approve", approveSchedule);
router.patch("/:id/reject", rejectSchedule);

export default router;