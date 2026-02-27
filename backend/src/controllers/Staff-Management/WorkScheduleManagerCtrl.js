import mongoose from "mongoose";
import WorkSchedule from "../../models/Staff-Management/StaffWorkScheduleModel.js";
import Staff from "../../models/Staff-Management/StaffModel.js";

const ROLE_TASK_RULES = {
  Cleaner: ["Cleaning"],
  Technician: ["Maintenance", "Inspection"],
  Supervisor: ["Inspection"], // optional
};

// ✅ Manager: Assign schedule
export const assignSchedule = async (req, res) => {
  try {
    const { staffId, taskType, restroomId, restroomLabel, title, date, startTime, endTime, managerNote } =
      req.body;

    if (!staffId || !taskType || !title || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    const allowed = ROLE_TASK_RULES[staff.role] || [];
    if (!allowed.includes(taskType)) {
      return res.status(400).json({ message: `Cannot assign ${taskType} to ${staff.role}` });
    }

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
      status: "Assigned",
    });

    return res.status(201).json(schedule);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Manager: List schedules (filters)
export const listSchedules = async (req, res) => {
  try {
    const { status, staffId, date } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (staffId) filter.staffId = staffId;

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

// ✅ Manager: Get single schedule
export const getSingleSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid schedule id" });
    }

    const schedule = await WorkSchedule.findById(id)
      .select(
        "taskType staffId restroomId restroomLabel title date startTime endTime status managerNote managerReviewNote verifiedAt createdAt updatedAt"
      )
      .populate("staffId", "fullName email phone role");

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    return res.json(schedule);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Manager: Edit schedule
export const editSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid schedule id" });
    }

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Not found" });

    // Optional rule: do not edit after Verified
    if (schedule.status === "Verified") {
      return res.status(400).json({ message: "Cannot edit Verified schedule" });
    }

    const updated = await WorkSchedule.findByIdAndUpdate(id, req.body, { new: true });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Manager: Cancel schedule
export const cancelSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Not found" });

    schedule.status = "Cancelled";
    await schedule.save();

    return res.json(schedule);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
//Delete schedule 
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const schedule = await WorkSchedule.findByIdAndDelete(id);

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    return res.json({ message: "Schedule deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Manager: Approve (Completed -> Verified)
export const approveSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerReviewNote } = req.body;

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Not found" });

    if (schedule.status !== "Completed") {
      return res.status(400).json({ message: "Only Completed schedules can be approved" });
    }

    schedule.status = "Verified";
    schedule.verifiedAt = new Date();
    schedule.managerReviewNote = managerReviewNote || "";
    await schedule.save();

    return res.json(schedule);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Manager: Reject (Completed -> Rejected)
export const rejectSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerReviewNote } = req.body;

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Not found" });

    if (schedule.status !== "Completed") {
      return res.status(400).json({ message: "Only Completed schedules can be rejected" });
    }

    schedule.status = "Rejected";
    schedule.managerReviewNote = managerReviewNote || "Rejected by manager";
    await schedule.save();

    return res.json(schedule);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};