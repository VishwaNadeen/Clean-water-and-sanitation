// backend/models/Staff-Management/StaffModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const StaffSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    nic: { type: String, required: true, trim: true, unique: true },

    countryCode: { type: String, required: true, trim: true, default: "+94" },

    phone: { type: Number, required: true },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    role: {
      type: String,
      enum: ["Cleaner", "Supervisor", "Technician"],
      required: true,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE"],
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "OnLeave"],
      default: "Active",
    },

    mustChangePassword: { type: Boolean, default: true },

    baseProvince: { type: String, required: true, trim: true },
    baseDistrict: { type: String, required: true, trim: true },

    address: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    joinDate: { type: Date, default: Date.now },

    password: { type: String, required: true, select: false },

    userId: { type: Schema.Types.ObjectId, ref: "User" },

    profileImageUrl: { type: String, trim: true, default: "" },
    profileImagePublicId: { type: String, trim: true, default: "" },

    deleteRequest: {
      requested: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ["idle", "pending", "rejected"],
        default: "idle",
      },
      reason: { type: String, default: "" },
      requestedAt: { type: Date },
      requestedBy: { type: Schema.Types.ObjectId },
      adminResponse: { type: String, default: "" },
      reviewedAt: { type: Date },
      reviewedBy: { type: Schema.Types.ObjectId },
    },
  },
  { timestamps: true }
);

StaffSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

StaffSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.Staff || mongoose.model("Staff", StaffSchema);
