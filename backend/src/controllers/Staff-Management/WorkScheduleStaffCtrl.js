import WorkSchedule from "../../models/Staff-Management/WorkScheduleModel.js";
import { uploadBufferToCloudinary } from "../../utils/staff-Management/Staffcloudinary.js";
import cloudinary from "../../config/cloudinary.js";

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

// Staff: Undo start (InProgress -> Assigned)
// PATCH /api/staff/work-schedules/:id/revert-start
export const revertStartWork = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { id } = req.params;

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Not found" });

    if (schedule.staffId.toString() !== staffId) {
      return res.status(403).json({ message: "Not your schedule" });
    }

    if (schedule.status !== "InProgress") {
      return res.status(400).json({ message: "Only InProgress schedules can be changed back" });
    }

    schedule.status = "Assigned";
    schedule.startedAt = undefined;

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
    console.log("staffId:", staffId);
    console.log("scheduleId:", id);
    console.log("req.file:", req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    } : null);

    // Check Cloudinary config
    console.log("Cloudinary config:", {
      cloud_name: process.env.CLOUDINARY_NAME ? "SET" : "NOT SET",
      api_key: process.env.CLOUDINARY_API_KEY ? "SET" : "NOT SET",
      api_secret: process.env.CLOUDINARY_SECRET_KEY ? "SET" : "NOT SET",
    });

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });

    if (schedule.staffId.toString() !== staffId) {
      return res.status(403).json({ message: "Not your schedule" });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "Proof image is required" });
    }

    let result;
    
    // Try Cloudinary upload first, fallback to base64 if not configured
    if (process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_SECRET_KEY) {
      console.log("Attempting to upload to Cloudinary...");
      try {
        result = await uploadBufferToCloudinary(req.file.buffer, "work-proofs");
        console.log("Cloudinary upload successful:", result);
      } catch (cloudinaryError) {
        console.error("Cloudinary upload failed, using fallback:", cloudinaryError.message);
        // Fallback: convert to base64
        const base64Image = req.file.buffer.toString('base64');
        const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
        result = {
          secure_url: dataUrl,
          public_id: `local_${Date.now()}_${req.file.originalname}`
        };
      }
    } else {
      console.log("Cloudinary not configured, using base64 fallback");
      // Fallback: convert to base64
      const base64Image = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
      result = {
        secure_url: dataUrl,
        public_id: `local_${Date.now()}_${req.file.originalname}`
      };
    }

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

// Staff: Remove uploaded proof image
// DELETE /api/staff/work-schedules/:id/proof
export const removeProof = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { id } = req.params;
    const { publicId } = req.body || {};

    if (!publicId) {
      return res.status(400).json({ message: "Proof image publicId is required" });
    }

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });

    if (schedule.staffId.toString() !== staffId) {
      return res.status(403).json({ message: "Not your schedule" });
    }

    if (schedule.status !== "InProgress") {
      return res
        .status(400)
        .json({ message: "Proof images can only be removed while work is in progress" });
    }

    const proofExists = Array.isArray(schedule.proofImages)
      ? schedule.proofImages.some((image) => image.publicId === publicId)
      : false;

    if (!proofExists) {
      return res.status(404).json({ message: "Proof image not found" });
    }

    schedule.proofImages = schedule.proofImages.filter((image) => image.publicId !== publicId);

    if (!String(publicId).startsWith("local_")) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Failed to remove proof image from cloudinary:", error.message);
      }
    }

    await schedule.save();

    return res.status(200).json({
      message: "Proof image removed successfully",
      schedule,
    });
  } catch (err) {
    console.error("removeProof ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

// Staff: Rework rejected task (Rejected -> InProgress)
// PATCH /api/staff/work-schedules/:id/rework
export const reworkRejected = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { id } = req.params;

    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });

    if (schedule.staffId.toString() !== staffId) {
      return res.status(403).json({ message: "Not your schedule" });
    }

    if (schedule.status !== "Rejected") {
      return res.status(400).json({ message: "Only rejected tasks can be reworked" });
    }

    if (Array.isArray(schedule.proofImages) && schedule.proofImages.length > 0) {
      await Promise.all(
        schedule.proofImages.map(async (image) => {
          if (image?.publicId && !String(image.publicId).startsWith("local_")) {
            try {
              await cloudinary.uploader.destroy(image.publicId);
            } catch (error) {
              console.error("Failed to remove old rework proof from cloudinary:", error.message);
            }
          }
        })
      );
    }

    schedule.status = "InProgress";
    schedule.startedAt = new Date();
    schedule.completedAt = undefined;
    schedule.proofImages = [];
    schedule.staffNote = "";
    schedule.materialsUsed = "";
    schedule.issuesFound = "";

    await schedule.save();

    return res.status(200).json({
      message: "Task moved to rework. Please do the work again and submit proof.",
      schedule,
    });
  } catch (err) {
    console.error("reworkRejected ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};
