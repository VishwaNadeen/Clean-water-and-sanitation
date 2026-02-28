import mongoose from "mongoose";
import Staff from "../../models/Staff-Management/StaffModel.js"; 
import WorkSchedule from "../../models/Staff-Management/StaffWorkScheduleModel.js";

//this does NOT compile a new model
const getIssueModel = () => {
  const Issue = mongoose.models.Issue; // already registered by other member
  if (!Issue) {
    // This means your server didn't import issue model yet
    throw new Error(
      "Issue model not registered. Make sure Issue routes/model are imported before IssueAssignCtrl is used."
    );
  }
  return Issue;
};

const ROLE_TASK_RULES = {
  Cleaner: ["Cleaning"],
  Technician: ["Maintenance", "Inspection"],
  Supervisor: ["Inspection"],
};

// POST /api/manager/issue-assign/:issueId
export const assignIssueToStaff = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { staffId, date, startTime, endTime, title } = req.body;

    if (!mongoose.Types.ObjectId.isValid(issueId))
      return res.status(400).json({ message: "Invalid issueId" });

    if (!mongoose.Types.ObjectId.isValid(staffId))
      return res.status(400).json({ message: "Invalid staffId" });

    if (!date || !startTime || !endTime || !title)
      return res.status(400).json({ message: "date, startTime, endTime, title required" });

    const Issue = getIssueModel();

    // read issue using existing model
    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    // staff checks
    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    if (staff.status !== "Active")
      return res.status(400).json({ message: "Staff is not Active" });

    // role-task validation (use issue.category or issue.taskType depending on their model)
    const issueCategory = issue.category || issue.taskType;
    const allowed = ROLE_TASK_RULES[staff.role] || [];
    if (!allowed.includes(issueCategory)) {
      return res.status(400).json({
        message: `Cannot assign ${issueCategory} to ${staff.role}`,
      });
    }

    // create schedule linked to issueId
    const schedule = await WorkSchedule.create({
      taskType: issueCategory,
      staffId,
      issueId: issue._id,     // <-- add issueId field in WorkSchedule model
      title,
      date: new Date(date),
      startTime,
      endTime,
      status: "Pending",
      restroomLabel: "",
    });

    // update issue (only if their model has these fields)
    issue.assignedStaffId = staffId;
    issue.assignedAt = new Date();
    issue.status = "Assigned";
    await issue.save();

    return res.status(201).json({
      message: "Assigned successfully",
      schedule,
      issueId: issue._id,
      staffId,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};