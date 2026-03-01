import WorkSchedule from "../../models/Staff-Management/WorkScheduleStaffModel.js";
import { uploadBufferToCloudinary } from "../../utils/staff-Management/Staffcloudinary.js";

// Staff: Get my schedules
// GET /api/staff/work-schedules/me?staffId=xxxx
export const getMySchedules = async (req, res) => {
  try {
    const staffId = req.user.id; // 👈 from JWT

    const schedules = await WorkSchedule
      .find({ staffId })
      .sort({ date: 1, startTime: 1 });

    return res.json(schedules);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//  Staff: Start (Assigned -> InProgress)
// PATCH /api/staff/work-schedules/:id/start?staffId=xxxx
export const startWork = async (req, res) => {
  try {
    const staffId = req.user.id; // ✅ from JWT
    const { id } = req.params;

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Not found" });

    if (schedule.staffId.toString() !== staffId) {
      return res.status(403).json({ message: "Not your schedule" });
    }

    if (schedule.status !== "Assigned") {
      return res
        .status(400)
        .json({ message: "Only Assigned schedules can be started" });
    }

    schedule.status = "InProgress";
    schedule.startedAt = new Date();
    await schedule.save();

    return res.json(schedule);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// staff: Upload proof image
// POST /api/staff/work-schedules/:id/proof?staffId=xxxx  (form-data key = proof)
export const uploadProof = async (req, res) => {
  try {
    const staffId = req.user.id; // ✅ from JWT
    const { id } = req.params;

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Not found" });

    if (schedule.staffId.toString() !== staffId) {
      return res.status(403).json({ message: "Not your schedule" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Proof image is required" });
    }

    const result = await uploadBufferToCloudinary(
      req.file.buffer,
      "work-proofs"
    );

    schedule.proofImages.push({
      url: result.secure_url,
      publicId: result.public_id,
    });

    await schedule.save();
    return res.json(schedule);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Staff: Complete (InProgress -> Completed) only if proof uploaded
// PATCH /api/staff/work-schedules/:id/complete?staffId=xxxx
export const completeWork = async (req, res) => {
  try {
    const staffId = req.user.id; // ✅ from JWT
    const { id } = req.params;
    const { staffNote } = req.body;

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Not found" });

    if (schedule.staffId.toString() !== staffId) {
      return res.status(403).json({ message: "Not your schedule" });
    }

    if (schedule.status !== "InProgress") {
      return res
        .status(400)
        .json({ message: "Only InProgress schedules can be completed" });
    }

    if (!schedule.proofImages || schedule.proofImages.length === 0) {
      return res
        .status(400)
        .json({ message: "Upload proof image before completing" });
    }

    schedule.status = "Completed";
    schedule.completedAt = new Date();
    schedule.staffNote = staffNote || "";
    await schedule.save();

    return res.json(schedule);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};