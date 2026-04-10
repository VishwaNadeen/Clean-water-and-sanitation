import mongoose from "mongoose";
import Staff from "../../models/Staff-Management/StaffModel.js";
import WorkSchedule from "../../models/Staff-Management/WorkScheduleModel.js";

// gets the already-registered Issue model
const getIssueModel = () => {
  const Issue = mongoose.models.Issue;
  if (!Issue) {
    throw new Error(
      "Issue model not registered. Make sure Issue model/routes are imported BEFORE IssueAssign routes."
    );
  }
  return Issue;
};

// role -> allowed task types
const ROLE_TASK_RULES = {
  Cleaner: ["Cleaning"],
  Technician: ["Maintenance"],
  Supervisor: ["Inspection"],
};

const getSafeErrorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  if (err?.name === "CastError") {
    if (err.path === "issueId") return "Invalid issue selection.";
    if (err.path === "staffId") return "Invalid staff member selection.";
    if (err.path === "_id") return "Invalid record id.";
    return "Invalid data format.";
  }

  if (err?.name === "ValidationError") {
    return "Invalid assignment data. Please review the form fields.";
  }

  return fallback;
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

// safe set helper (only set field if exists in schema)
const setIfPathExists = (doc, path, value) => {
  if (doc?.schema?.path(path)) doc[path] = value;
};

/**
 * POST /api/manager/issue-assign/:issueId/assign
 * Body: { staffId, date, startTime, endTime, title, issueTaskType, restroomId, restroomLabel, managerNote }
 *
 * Requires route middleware: protect + authorizeRoles("ADMIN")
 */
export const assignIssueToStaff = async (req, res) => {
  try {
    const { issueId } = req.params;

    const {
      staffId,
      date,
      startTime,
      endTime,
      title,
      issueTaskType,
      restroomId, // optional
      restroomLabel, // optional
      managerNote, // optional
    } = req.body;

    // -------- validate inputs --------
    if (!isValidObjectId(issueId)) {
      return res.status(400).json({ message: "Invalid issueId" });
    }
    if (!isValidObjectId(staffId)) {
      return res.status(400).json({ message: "Invalid staffId" });
    }

    if (!date || !startTime || !endTime || !title) {
      return res.status(400).json({
        message: "date, startTime, endTime, title are required",
      });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({ message: "Invalid date" });
    }

    if (!isValidHHMM(startTime) || !isValidHHMM(endTime)) {
      return res.status(400).json({ message: "Time must be HH:mm format" });
    }

    if (toMinutes(startTime) >= toMinutes(endTime)) {
      return res
        .status(400)
        .json({ message: "startTime must be before endTime" });
    }

    if (restroomId && !isValidObjectId(restroomId)) {
      return res.status(400).json({ message: "Invalid restroomId" });
    }

    const Issue = getIssueModel();

    // -------- load issue --------
    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    // ✅ better check for "open" in any casing ("OPEN", "Open", "open")
    if (issue.status) {
      const st = String(issue.status).toLowerCase();
      if (st !== "open") {
        return res.status(400).json({
          message: `Cannot assign issue because status is ${issue.status}`,
        });
      }
    }

    // -------- load staff --------
    const staff = await Staff.findById(staffId).select("role status");
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    if (String(staff.status) !== "Active") {
      return res.status(400).json({ message: "Staff is not Active" });
    }

    // -------- determine taskType --------
    // prefer request body (because issue schema may not have taskType/category)
    const taskFromIssue =
      issue.taskType ||
      issue.category ||
      issue.issueTaskType ||
      issue.type ||
      (issue.categoryId ? "Inspection" : null);

    const finalTaskType = issueTaskType || taskFromIssue;

    if (!finalTaskType) {
      return res.status(400).json({
        message:
          "issueTaskType is required (Issue model has no taskType/category field)",
      });
    }

    // -------- role-task validation --------
    const allowed = ROLE_TASK_RULES[staff.role] || [];
    if (!allowed.includes(finalTaskType)) {
      return res.status(400).json({
        message: `Cannot assign ${finalTaskType} to ${staff.role}`,
      });
    }

    // -------- time overlap check (same staff, same day) --------
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(24, 0, 0, 0);

    const sameDaySchedules = await WorkSchedule.find({
      staffId,
      date: { $gte: dayStart, $lt: dayEnd },
      status: { $in: ["Pending", "Assigned", "InProgress"] },
    }).select("startTime endTime");

    const clash = sameDaySchedules.some((s) =>
      isTimeOverlap(startTime, endTime, s.startTime, s.endTime)
    );

    if (clash) {
      return res.status(409).json({
        message: "This staff member is already assigned for the selected time slot.",
      });
    }

    // -------- create schedule (linked to issue) --------
    const scheduleData = {
      taskType: finalTaskType,
      staffId,
      issueId: issue._id,
      title: String(title).trim(),
      date: new Date(date),
      startTime,
      endTime,
      status: "Assigned",
      restroomLabel: restroomLabel || "",
      managerNote: managerNote || "",
    };

    // only add restroomId if your WorkSchedule schema has it + you provided it
    if (restroomId) scheduleData.restroomId = restroomId;

    const schedule = await WorkSchedule.create(scheduleData);

    // -------- update issue link only --------
    setIfPathExists(issue, "assignedStaffId", staffId);
    setIfPathExists(issue, "assignedAt", new Date());

    await issue.save();

    return res.status(201).json({
      message: "Assigned successfully",
      schedule,
      issue,
    });
  } catch (err) {
    return res.status(500).json({ message: getSafeErrorMessage(err) });
  }
};
