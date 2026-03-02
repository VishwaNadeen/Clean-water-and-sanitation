import WorkSchedule from "../../models/Staff-Management/WorkScheduleModel.js";
import { uploadBufferToCloudinary } from "../../utils/staff-Management/Staffcloudinary.js";

// Staff: Get my schedules
// GET /api/staff/work-schedules/me
export const getMySchedules = async (req, res) => {
  try {
    const staffId = req.user.id;

    const schedules = await WorkSchedule.find({ staffId })
      .populate("staffId", "fullName role")
      .sort({ date: 1, startTime: 1 });

    return res.json(schedules);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Staff: Start (Assigned -> InProgress)
// PATCH /api/staff/work-schedules/:id/start
export const startWork = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { id } = req.params;

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Not found" });

    if (schedule.staffId.toString() !== staffId) {
      return res.status(403).json({ message: "Not your schedule" });
    }

    if (schedule.status !== "Assigned") {
      return res.status(400).json({ message: "Only Assigned schedules can be started" });
    }

    //  do NOT read status from req.body
    schedule.status = "InProgress";
    schedule.startedAt = new Date();

    await schedule.save();
    return res.json(schedule);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Staff: Upload proof image
// POST /api/staff/work-schedules/:id/proof  (form-data key = proof)
export const uploadProof = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { id } = req.params;

    console.log("✅ uploadProof HIT");
    console.log("req.file:", req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    } : null);

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });

    if (schedule.staffId.toString() !== staffId) {
      return res.status(403).json({ message: "Not your schedule" });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "Proof image is required" });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, "work-proofs");

    schedule.proofImages.push({
      url: result.secure_url,
      publicId: result.public_id,
      uploadedAt: new Date(),
    });

    await schedule.save();

    return res.status(200).json({
      message: "Proof uploaded successfully",
      schedule,
    });
  } catch (err) {
    console.error("❌ uploadProof ERROR:", err);
    return res.status(500).json({
      message: err.message,
      stack: err.stack,
    });
  }
};

// Staff: Complete (InProgress -> Completed)
// PATCH /api/staff/work-schedules/:id/complete
export const completeWork = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { id } = req.params;

    const { staffNote, materialsUsed, issuesFound } = req.body;

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Not found" });

    if (schedule.staffId.toString() !== staffId) {
      return res.status(403).json({ message: "Not your schedule" });
    }

    if (schedule.status !== "InProgress") {
      return res.status(400).json({ message: "Only InProgress schedules can be completed" });
    }

    if (!schedule.proofImages || schedule.proofImages.length === 0) {
      return res.status(400).json({ message: "Upload proof image before completing" });
    }

    schedule.status = "Completed";
    schedule.completedAt = new Date();

    schedule.staffNote = staffNote || "";
    schedule.materialsUsed = materialsUsed || "";
    schedule.issuesFound = issuesFound || "";

    await schedule.save();
    return res.json(schedule);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};