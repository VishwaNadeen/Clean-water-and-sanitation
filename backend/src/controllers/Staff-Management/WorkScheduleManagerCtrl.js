import mongoose from "mongoose";
import WorkSchedule from "../../models/Staff-Management/WorkScheduleModel.js";
import Staff from "../../models/Staff-Management/StaffModel.js";

const ROLE_TASK_RULES = {
  Cleaner: ["Cleaning"],
  Technician: ["Maintenance"],
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

const isTimeOverlap = (startA, endA, startB, endB) => {
  const a1 = toMinutes(startA);
  const a2 = toMinutes(endA);
  const b1 = toMinutes(startB);
  const b2 = toMinutes(endB);
  return a1 < b2 && a2 > b1;
};

// overlap check: same staff, same day, overlapping time, not cancelled
const hasOverlap = async ({ staffId, date, startTime, endTime, excludeId }) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(24, 0, 0, 0);

  const q = {
    staffId,
    status: { $ne: "Cancelled" },
    date: { $gte: dayStart, $lt: dayEnd },
  };

  if (excludeId) q._id = { $ne: excludeId };

  const existing = await WorkSchedule.find(q).select("startTime endTime").lean();

  return existing.some((s) => isTimeOverlap(startTime, endTime, s.startTime, s.endTime));
};

const normalizeOptionalObjectId = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const text = String(value).trim();
  if (!text) return null;
  return text;
};

const getSafeErrorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  if (err?.name === "CastError") {
    if (err.path === "issueId") return "Invalid issue selection.";
    if (err.path === "staffId") return "Invalid staff member selection.";
    if (err.path === "_id") return "Invalid record id.";
    return "Invalid data format.";
  }

  if (err?.name === "ValidationError") {
    return "Invalid schedule details. Please check the form fields.";
  }

  return fallback;
};

const getDailyAssignedCount = async ({ staffId, date, excludeId }) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(24, 0, 0, 0);

  const q = {
    staffId,
    status: { $ne: "Cancelled" },
    date: { $gte: dayStart, $lt: dayEnd },
  };

  if (excludeId) q._id = { $ne: excludeId };

  return WorkSchedule.countDocuments(q);
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

    const normalizedIssueId = normalizeOptionalObjectId(issueId);

    // ObjectId validations
    if (!isValidObjectId(staffId)) {
      return res.status(400).json({ message: "Invalid staffId" });
    }
    if (restroomId && !isValidObjectId(restroomId)) {
      return res.status(400).json({ message: "Invalid restroomId" });
    }
    if (normalizedIssueId && !isValidObjectId(normalizedIssueId)) {
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
    const staff = await Staff.findById(staffId).select("role status fullName email phone");
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    const normalizedStaffStatus = String(staff.status || "").toLowerCase();
    if (normalizedStaffStatus === "onleave") {
      return res.status(400).json({ message: "Cannot assign work: staff member is On Leave" });
    }
    if (normalizedStaffStatus !== "active") {
      return res.status(400).json({ message: "Cannot assign work: staff member is not Active" });
    }

    const allowed = ROLE_TASK_RULES[staff.role] || [];
    if (!allowed.includes(taskType)) {
      return res.status(400).json({ message: `Cannot assign ${taskType} to ${staff.role}` });
    }

    // overlap check
    const overlap = await hasOverlap({ staffId, date, startTime, endTime });
    if (overlap) {
      return res.status(409).json({
        message: "This staff member is already assigned for the selected time slot.",
      });
    }

    const dailyCount = await getDailyAssignedCount({ staffId, date });
    if (dailyCount >= 4) {
      return res.status(409).json({
        message: "Cannot assign more work: staff member already has 4 schedules for this day",
      });
    }

    // create
    const created = await WorkSchedule.create({
      staffName: staff.fullName,
      staffId,
      taskType,
      restroomId: restroomId || undefined,
      restroomLabel: restroomLabel || "",
      title: String(title).trim(),
      date: new Date(date),
      startTime,
      endTime,
      managerNote: managerNote || "",
      issueId: normalizedIssueId || null,
      status: "Assigned",
    });

    // ✅ populate staff details in response
    const schedule = await WorkSchedule.findById(created._id)
      .populate("staffId", "fullName email phone role");

    return res.status(201).json(schedule);
  } catch (err) {
    return res.status(500).json({ message: getSafeErrorMessage(err) });
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
    return res.status(500).json({ message: getSafeErrorMessage(err) });
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
    return res.status(500).json({ message: getSafeErrorMessage(err) });
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
    if (Object.prototype.hasOwnProperty.call(updates, "issueId")) {
      updates.issueId = normalizeOptionalObjectId(updates.issueId);
      if (updates.issueId && !isValidObjectId(updates.issueId)) {
        return res.status(400).json({ message: "Invalid issueId" });
      }
    }

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
        message: "This staff member is already assigned for the selected time slot.",
      });
    }

    const nextStaff = await Staff.findById(newStaffId).select("status");
    if (!nextStaff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const normalizedStaffStatus = String(nextStaff.status || "").toLowerCase();
    if (normalizedStaffStatus === "onleave") {
      return res.status(400).json({ message: "Cannot assign work: staff member is On Leave" });
    }
    if (normalizedStaffStatus !== "active") {
      return res.status(400).json({ message: "Cannot assign work: staff member is not Active" });
    }

    const dailyCount = await getDailyAssignedCount({
      staffId: newStaffId,
      date: newDate,
      excludeId: id,
    });
    if (dailyCount >= 4) {
      return res.status(409).json({
        message: "Cannot assign more work: staff member already has 4 schedules for this day",
      });
    }

    const updated = await WorkSchedule.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("staffId", "fullName email phone role");

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: getSafeErrorMessage(err) });
  }
};

// ---------- Manager: Cancel schedule ----------
export const cancelSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Not found" });

    if (schedule.status === "Verified") {
      return res.status(400).json({ message: "Cannot cancel Verified schedule" });
    }

    schedule.status = "Cancelled";
    await schedule.save({ validateBeforeSave: false });

    const populated = await WorkSchedule.findById(id).populate(
      "staffId",
      "fullName email phone role"
    );

    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: getSafeErrorMessage(err) });
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
    return res.status(500).json({ message: getSafeErrorMessage(err) });
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

    const populated = await WorkSchedule.findById(id).populate(
      "staffId",
      "fullName email phone role"
    );

    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: getSafeErrorMessage(err) });
  }
};

// ---------- Manager: Reject ----------
export const rejectSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerReviewNote } = req.body;

    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    if (!String(managerReviewNote || "").trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Not found" });

    if (schedule.status !== "Completed") {
      return res.status(400).json({ message: "Only Completed schedules can be rejected" });
    }

    schedule.status = "Rejected";
    schedule.managerReviewNote = String(managerReviewNote).trim();
    await schedule.save();

    const populated = await WorkSchedule.findById(id).populate(
      "staffId",
      "fullName email phone role"
    );

    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: getSafeErrorMessage(err) });
  }
};
