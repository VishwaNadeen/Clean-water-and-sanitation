import mongoose from "mongoose";

const proofImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const workScheduleSchema = new mongoose.Schema(
  {
    staffName: { type: String, trim: true, default: "" },

    taskType: {
      type: String,
      enum: ["Cleaning", "Maintenance", "Inspection"],
      required: true,
    },

    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
      index: true,
    },

    restroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restroom",
      required: true,
      index: true,
    },

    restroomLabel: { type: String, trim: true, default: "" },

    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      default: null,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 80,
    },

    date: { type: Date, required: true, index: true },

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
      enum: ["Assigned", "InProgress", "Completed", "Verified", "Rejected", "Cancelled"],
      default: "Assigned",
      index: true,
    },

    staffNote: { type: String, trim: true },
    materialsUsed: { type: String, trim: true },
    issuesFound: { type: String, trim: true },

    proofImages: { type: [proofImageSchema], default: [] },

    startedAt: Date,
    completedAt: Date,

    managerNote: { type: String, trim: true },
    managerReviewNote: { type: String, trim: true },
    verifiedAt: Date,
  },
  { timestamps: true }
);

// ✅ Async hook style: NO next()
workScheduleSchema.pre("validate", async function () {
  // staffName auto-fill
  if (this.staffId && (!this.staffName || this.staffName.trim() === "")) {
    const Staff = mongoose.models.Staff; // safer than mongoose.model("Staff")
    if (Staff) {
      const staff = await Staff.findById(this.staffId).select("fullName");
      if (staff?.fullName) this.staffName = staff.fullName;
    }
  }

  // restroomLabel auto-fill
  if (this.restroomId && (!this.restroomLabel || this.restroomLabel.trim() === "")) {
    const Restroom = mongoose.models.Restroom;
    if (Restroom) {
      const restroom = await Restroom
        .findById(this.restroomId)
        .select("restroomLabel label name title");

      this.restroomLabel =
        restroom?.restroomLabel ||
        restroom?.label ||
        restroom?.name ||
        restroom?.title ||
        this.restroomLabel;
    }
  }
});

workScheduleSchema.index({ staffId: 1, date: 1, startTime: 1 });

export default mongoose.models.WorkSchedule ||
  mongoose.model("WorkSchedule", workScheduleSchema);