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

    // 🔥 restroom module not ready yet -> keep flexible
    restroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restroom",
      required: false, // later you can make it true
    },

    // temporary fallback if restroomId not available
    restroomLabel: {
      type: String,
      trim: true,
      default: "",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    // date of the work
    date: { type: Date, required: true },

    // simple time strings (easy for frontend)
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "11:00"

    status: {
      type: String,
      enum: ["Assigned",
        "InProgress",
        "Completed",
        "Verified",
        "Rejected",
        "Cancelled",],
      default: "Pending",
    },

    managerNote: { type: String, default: "" },
    staffNote: { type: String, default: "" },
    managerReviewNote: { type: String, default: "" },

     proofImages: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: "" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    startedAt: { type: Date },
    completedAt: { type: Date },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);
export default mongoose.model("WorkSchedule", workScheduleSchema);