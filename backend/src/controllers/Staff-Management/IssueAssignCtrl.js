// src/controllers/Staff-Management/IssueAssignCtrl.js
import mongoose from "mongoose";
import Staff from "../../models/Staff-Management/StaffModel.js";
import WorkSchedule from "../../models/Staff-Management/StaffWorkScheduleModel.js";

// gets the already-registered Issue model (created by other member)
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
  Technician: ["Maintenance", "Inspection"],
  Supervisor: ["Inspection"], // optional
};

// time overlap helper (works for HH:mm strings)
const isTimeOverlap = (startA, endA, startB, endB) => startA < endB && endA > startB;

/**
 * POST /api/manager/issues/:issueId/assign
 * Body: { staffId, date, startTime, endTime, title }
 *
 * Requires route middleware: protect + authorizeRoles("ADMIN")
 */
export const assignIssueToStaff = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { staffId, date, startTime, endTime, title } = req.body;

    // 1) validate inputs
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({ message: "Invalid issueId" });
    }
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ message: "Invalid staffId" });
    }
    if (!date || !startTime || !endTime || !title) {
      return res.status(400).json({
        message: "date, startTime, endTime, title are required",
      });
    }

    const Issue = getIssueModel();

    // 2) load issue
    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    // optional: prevent assigning if already assigned
    if (issue.status && String(issue.status).toUpperCase() !== "OPEN") {
      // if your issue statuses are different, adjust this
      // you can allow reassign by removing this check
      return res.status(400).json({
        message: `Cannot assign issue because status is ${issue.status}`,
      });
    }

    // 3) load staff
    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    if (staff.status !== "Active") {
      return res.status(400).json({ message: "Staff is not Active" });
    }

    // 4) role-task validation
    const issueTaskType = issue.taskType || issue.category; // depends on issue schema
    if (!issueTaskType) {
      return res.status(400).json({
        message: "Issue does not have taskType/category field",
      });
    }

    const allowed = ROLE_TASK_RULES[staff.role] || [];
    if (!allowed.includes(issueTaskType)) {
      return res.status(400).json({
        message: `Cannot assign ${issueTaskType} to ${staff.role}`,
      });
    }

    // 5) optional: time conflict check (same staff, same date)
    // NOTE: assumes WorkSchedule has date as Date and startTime/endTime as "HH:mm"
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const sameDaySchedules = await WorkSchedule.find({
      staffId,
      date: { $gte: dayStart, $lt: dayEnd },
      status: { $in: ["Pending", "Assigned", "InProgress"] }, // match your enum values
    }).select("startTime endTime");

    const clash = sameDaySchedules.some((s) =>
      isTimeOverlap(startTime, endTime, s.startTime, s.endTime)
    );

    if (clash) {
      return res.status(400).json({
        message: "Staff already has a schedule in that time range",
      });
    }

    // 6) create schedule (linked to issue)
    // IMPORTANT: WorkSchedule schema must include issueId field
    const schedule = await WorkSchedule.create({
      taskType: issueTaskType,
      staffId,
      issueId: issue._id,
      title,
      date: new Date(date),
      startTime,
      endTime,
      status: "Assigned", // match your WorkSchedule default/status enum
      restroomLabel: "",  // keep if your schema requires
    });

    // 7) update issue (only if fields exist in their schema)
    issue.assignedStaffId = staffId;
    issue.assignedAt = new Date();
    issue.status = "Assigned";

    await issue.save();

    return res.status(201).json({
      message: "Assigned successfully",
      schedule,
      issue,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};