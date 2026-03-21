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
// Manager only
router.post("/", protect, authorizeRoles("ADMIN"), assignSchedule);
router.get("/", protect, authorizeRoles("ADMIN"), listSchedules);
router.get("/:id", protect, authorizeRoles("ADMIN"), getSingleSchedule);
router.put("/:id", protect, authorizeRoles("ADMIN"), editSchedule);
router.patch("/:id/cancel", protect, authorizeRoles("ADMIN"), cancelSchedule);
router.delete("/:id", protect, authorizeRoles("ADMIN"), deleteSchedule);
router.patch("/:id/approve", protect, authorizeRoles("ADMIN"), approveSchedule);
router.patch("/:id/reject", protect, authorizeRoles("ADMIN"), rejectSchedule);

export default router;