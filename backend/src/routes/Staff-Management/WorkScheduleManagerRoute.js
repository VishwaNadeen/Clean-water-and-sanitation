import express from "express";
import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";
import {
  assignSchedule,
  listSchedules,
  editSchedule,
  cancelSchedule,
  approveSchedule,
  rejectSchedule,
  getSingleSchedule,
  deleteSchedule
} from "../../controllers/Staff-Management/WorkScheduleManagerCtrl.js";

const router = express.Router();

// Manager endpoints
router.use(protect, authorizeRoles("ADMIN"));
router.post("/", assignSchedule);
router.get("/", listSchedules);
router.get("/:id", getSingleSchedule);
router.put("/:id", editSchedule);
router.delete("/:id", deleteSchedule);
router.patch("/:id/cancel", cancelSchedule);
router.patch("/:id/approve", approveSchedule);
router.patch("/:id/reject", rejectSchedule);

export default router;