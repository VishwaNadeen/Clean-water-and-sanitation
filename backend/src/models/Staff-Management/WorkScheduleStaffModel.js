import mongoose from "mongoose";

const workLogSchema = new mongoose.Schema(
  {
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

    status: {
      type: String,
      enum: ["Pending", "Assigned", "InProgress", "Completed", "Verified", "Rejected", "Cancelled"],
      default: "Pending",
    },

    staffNote: { type: String, default: "" },

    proofImages: {
      type: [{ url: String, publicId: String, uploadedAt: { type: Date, default: Date.now } }],
      default: [],
    },

    startedAt: { type: Date },
    completedAt: { type: Date },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.WorkLog || mongoose.model("WorkLog", workLogSchema);