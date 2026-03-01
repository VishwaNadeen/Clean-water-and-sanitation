import mongoose from "mongoose";

const workScheduleSchema = new mongoose.Schema(
  {
    taskType: {
      type: String,
      enum: ["Cleaning", "Maintenance", "Inspection"],
      required: true,
    },

    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },

    restroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restroom",
      required: true,
    },
     restroomLabel: {
      type: String,
      trim: true,
      default: "",
    },
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", default: null },

    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 80 },

    date: { type: Date, required: true },

    startTime: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
        message: "startTime must be HH:mm",
      },
    },

    endTime: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
        message: "endTime must be HH:mm",
      },
    },

    // ✅ ONLY manager lifecycle
    status: {
      type: String,
      enum: ["Assigned", "Cancelled", "Verified", "Rejected"],
      default: "Assigned",
    },

    managerNote: { type: String, default: "" },
    managerReviewNote: { type: String, default: "" },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.WorkSchedule ||
  mongoose.model("WorkSchedule", workScheduleSchema);