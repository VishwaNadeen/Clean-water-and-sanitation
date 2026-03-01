import mongoose from "mongoose";
import WorkSchedule from "../../models/Staff-Management/WorkScheduleManagerModel.js";
import Staff from "../../models/Staff-Management/StaffModel.js";

const ROLE_TASK_RULES = {
  Cleaner: ["Cleaning"],
  Technician: ["Maintenance", "Inspection"],
  Supervisor: ["Inspection"],
};

// ---------- helpers ----------
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isValidDate = (d) => {
  const dt = new Date(d);
  return !isNaN(dt.getTime());
};

const isValidHHMM = (t) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(t);

const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// overlap check: same staff, same day, overlapping time, not cancelled
const hasOverlap = async ({ staffId, date, startTime, endTime, excludeId }) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(24, 0, 0, 0);

  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime);

  const q = {
    staffId,
    status: { $ne: "Cancelled" },
    date: { $gte: dayStart, $lt: dayEnd },
    $expr: {
      // overlap if existing.start < new.end AND existing.end > new.start
      $and: [
        { $lt: [{ $toInt: { $substr: ["$startTime", 0, 2] } }, 24] }, // keep mongo happy
      ],
    },
  };

  // NOTE: startTime/endTime are strings. We'll compare by converting to minutes in JS after pulling
  const existing = await WorkSchedule.find(q).select("startTime endTime").lean();

  const conflicts = existing.some((s) => {
    const a = toMinutes(s.startTime);
    const b = toMinutes(s.endTime);
    return a < endMin && b > startMin;
  });

  if (!conflicts) return false;

  // if editing, ignore overlap with itself by filtering out excludeId before JS check
  if (!excludeId) return true;

  const existing2 = await WorkSchedule.find({
    staffId,
    status: { $ne: "Cancelled" },
    date: { $gte: dayStart, $lt: dayEnd },
    _id: { $ne: excludeId },
  })
    .select("startTime endTime")
    .lean();

  return existing2.some((s) => {
    const a = toMinutes(s.startTime);
    const b = toMinutes(s.endTime);
    return a < endMin && b > startMin;
  });
};

// ---------- Manager: Assign schedule ----------
export const assignSchedule = async (req, res) => {
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
      issueId,
    } = req.body;

    // required
    if (!staffId || !taskType || !title || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ObjectId validations
    if (!isValidObjectId(staffId)) {
      return res.status(400).json({ message: "Invalid staffId" });
    }
    if (restroomId && !isValidObjectId(restroomId)) {
      return res.status(400).json({ message: "Invalid restroomId" });
    }
    if (issueId && !isValidObjectId(issueId)) {
      return res.status(400).json({ message: "Invalid issueId" });
    }

    // date + time format
    if (!isValidDate(date)) {
      return res.status(400).json({ message: "Invalid date" });
    }
    if (!isValidHHMM(startTime) || !isValidHHMM(endTime)) {
      return res.status(400).json({ message: "Time must be in HH:mm format" });
    }
    if (toMinutes(startTime) >= toMinutes(endTime)) {
      return res.status(400).json({ message: "startTime must be before endTime" });
    }

    // staff exists + role rule
    const staff = await Staff.findById(staffId).select("role");
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    const allowed = ROLE_TASK_RULES[staff.role] || [];
    if (!allowed.includes(taskType)) {
      return res
        .status(400)
        .json({ message: `Cannot assign ${taskType} to ${staff.role}` });
    }

    // overlap check
    const overlap = await hasOverlap({ staffId, date, startTime, endTime });
    if (overlap) {
      return res.status(409).json({
        message: "Schedule conflict: Staff already has a schedule during this time",
      });
    }

    const schedule = await WorkSchedule.create({
      staffId,
      taskType,
      restroomId: restroomId || undefined,
      restroomLabel: restroomLabel || "",
      title: title.trim(),
      date: new Date(date),
      startTime,
      endTime,
      managerNote: managerNote || "",
      issueId: issueId || null,
      status: "Assigned",
    });

    return res.status(201).json(schedule);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------- Manager: List schedules (filters) ----------
export const listSchedules = async (req, res) => {
  try {
    const { status, staffId, date, taskType } = req.query;

    const filter = {};
    if (status) filter.status = status;

    if (staffId) {
      if (!isValidObjectId(staffId)) {
        return res.status(400).json({ message: "Invalid staffId" });
      }
      filter.staffId = staffId;
    }

    if (taskType) filter.taskType = taskType;

    if (date) {
      if (!isValidDate(date)) return res.status(400).json({ message: "Invalid date" });
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(24, 0, 0, 0);
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

// ---------- Manager: Get single schedule ----------
export const getSingleSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid schedule id" });
    }

    const schedule = await WorkSchedule.findById(id)
      .select(
        "taskType staffId restroomId restroomLabel title date startTime endTime status managerNote managerReviewNote verifiedAt createdAt updatedAt issueId"
      )
      .populate("staffId", "fullName email phone role");

    if (!schedule) return res.status(404).json({ message: "Schedule not found" });

    return res.json(schedule);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------- Manager: Edit schedule ----------
export const editSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid schedule id" });
    }

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Not found" });

    if (schedule.status === "Verified") {
      return res.status(400).json({ message: "Cannot edit Verified schedule" });
    }

    const updates = { ...req.body };

    // if changing staffId/restroomId/date/time validate them
    if (updates.staffId && !isValidObjectId(updates.staffId))
      return res.status(400).json({ message: "Invalid staffId" });

    if (updates.restroomId && !isValidObjectId(updates.restroomId))
      return res.status(400).json({ message: "Invalid restroomId" });

    const newDate = updates.date ?? schedule.date;
    const newStart = updates.startTime ?? schedule.startTime;
    const newEnd = updates.endTime ?? schedule.endTime;
    const newStaffId = updates.staffId ?? schedule.staffId;

    if (updates.date && !isValidDate(updates.date))
      return res.status(400).json({ message: "Invalid date" });

    if ((updates.startTime && !isValidHHMM(updates.startTime)) || (updates.endTime && !isValidHHMM(updates.endTime)))
      return res.status(400).json({ message: "Time must be in HH:mm format" });

    if (toMinutes(newStart) >= toMinutes(newEnd))
      return res.status(400).json({ message: "startTime must be before endTime" });

    const overlap = await hasOverlap({
      staffId: newStaffId,
      date: newDate,
      startTime: newStart,
      endTime: newEnd,
      excludeId: id,
    });
    if (overlap) {
      return res.status(409).json({
        message: "Schedule conflict: Staff already has a schedule during this time",
      });
    }

    const updated = await WorkSchedule.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------- Manager: Cancel schedule ----------
export const cancelSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Not found" });

    // optional: block cancel after verified
    if (schedule.status === "Verified") {
      return res.status(400).json({ message: "Cannot cancel Verified schedule" });
    }

    schedule.status = "Cancelled";
    await schedule.save({ validateBeforeSave: false }); // ✅ prevents required validation issues

    return res.json(schedule);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------- Manager: Delete schedule ----------
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const schedule = await WorkSchedule.findByIdAndDelete(id);
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });

    return res.json({ message: "Schedule deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------- Manager: Approve ----------
export const approveSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerReviewNote } = req.body;

    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

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

// ---------- Manager: Reject ----------
export const rejectSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerReviewNote } = req.body;

    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

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