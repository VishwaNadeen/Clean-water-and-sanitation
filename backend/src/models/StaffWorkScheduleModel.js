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
      enum: ["Pending", "InProgress", "Completed", "Cancelled"],
      default: "Pending",
    },

    managerNote: { type: String, default: "" },
    staffNote: { type: String, default: "" },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or Manager model if you have
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("WorkSchedule", workScheduleSchema);