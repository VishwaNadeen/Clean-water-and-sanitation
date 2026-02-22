import express from "express";
import {
  createSchedule,
  getAllSchedules,
  getMySchedules,
  updateSchedule,
  updateMyScheduleStatus,
  deleteSchedule,
} from "../controllers/StaffWorkScheduleCtrl.js";

// If you have auth middleware use it
// import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// router.use(requireAuth);

/**
 * MANAGER SIDE
 */
router.post("/", createSchedule);          // create schedule
router.get("/", getAllSchedules);          // list schedules (manager)
router.put("/:id", updateSchedule);        // edit schedule
router.delete("/:id", deleteSchedule);     // cancel/delete schedule

/**
 * STAFF SIDE
 */
router.get("/me", getMySchedules);         // staff see own schedules
router.patch("/me/:id/status", updateMyScheduleStatus); // update status

export default router;