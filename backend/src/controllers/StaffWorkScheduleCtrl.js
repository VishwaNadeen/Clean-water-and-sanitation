import mongoose from "mongoose";
import WorkSchedule from "../models/StaffWorkScheduleModel.js";

/**
 * ✅ MANAGER: Create Schedule
 * POST /api/work-schedules
 */
import Staff from "../models/StaffModel.js";


const ROLE_TASK_RULES = {
  Cleaner: ["Cleaning"],
  Technician: ["Maintenance", "Inspection"],
};

export const createSchedule = async (req, res) => {
  try {
    const {
      staffId,
      taskType,
      restroomId,
      restroomLabel,
      title,
      date,
      startTime,
      endTime,
      managerNote,
    } = req.body;

    // ✅ Basic validation
    if (!staffId || !taskType || !title || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ================================
    // 🔥 ADD ROLE VALIDATION HERE
    // ================================

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const allowed = ROLE_TASK_RULES[staff.role] || [];

    if (!allowed.includes(taskType)) {
      return res.status(400).json({
        message: `Cannot assign ${taskType} to ${staff.role}`,
      });
    }

    // ================================
    // AFTER validation → create schedule
    // ================================

    const schedule = await WorkSchedule.create({
      staffId,
      taskType,
      restroomId: restroomId || undefined,
      restroomLabel: restroomLabel || "",
      title,
      date,
      startTime,
      endTime,
      managerNote: managerNote || "",
    });

    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ MANAGER: Get all schedules
 * GET /api/work-schedules?status=Pending&staffId=...
 */
export const getAllSchedules = async (req, res) => {
  try {
    const { status, staffId, date } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (staffId) filter.staffId = staffId;

    // if date is provided (YYYY-MM-DD), filter by that day
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const schedules = await WorkSchedule.find(filter)
      .populate("staffId", "fullName email phone role")
      .sort({ date: 1, startTime: 1 });

    return res.json(schedules);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ STAFF: Get my schedules
 * GET /api/work-schedules/me
 *
 * IMPORTANT:
 * - In real app, use req.user._id from auth
 * - For now, accept staffId from query for testing
 *   /me?staffId=xxxx
 */
export const getMySchedules = async (req, res) => {
  try {
    const staffId = req.query.staffId; // temporary for your testing

    if (!staffId) {
      return res.status(400).json({ message: "staffId is required for now" });
    }

    const schedules = await WorkSchedule.find({ staffId })
      .sort({ date: 1, startTime: 1 });

    return res.json(schedules);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ MANAGER: Update schedule (edit)
 * PUT /api/work-schedules/:id
 */
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid schedule id" });
    }

    const updated = await WorkSchedule.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Not found" });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ STAFF: Update my status
 * PATCH /api/work-schedules/me/:id/status
 *
 * For real app:
 * - validate schedule belongs to logged-in staff (req.user._id)
 */
export const updateMyScheduleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, staffNote } = req.body;

    const allowed = ["Pending", "InProgress", "Completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Not found" });

    schedule.status = status;
    if (staffNote !== undefined) schedule.staffNote = staffNote;

    await schedule.save();
    return res.json(schedule);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ MANAGER: Delete / Cancel
 * DELETE /api/work-schedules/:id
 */
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await WorkSchedule.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Not found" });

    return res.json({ message: "Schedule deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};