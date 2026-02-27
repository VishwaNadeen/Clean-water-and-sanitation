// backend/models/Staff-Management/StaffModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const StaffSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    nic: { type: String, required: true, trim: true, unique: true },

    // country code (e.g., +94)
    countryCode: { type: String, required: true, trim: true, default: "+94" },

    phone: { type: Number, required: true },

    // email required (because login creation needs it)
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

    baseProvince: { type: String, required: true, trim: true },
    baseDistrict: { type: String, required: true, trim: true },

    address: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    joinDate: { type: Date, default: Date.now },

    // password (hashed)
    password: { type: String, required: true, select: false },

    // optional link (not required)
    userId: { type: Schema.Types.ObjectId, ref: "User" },

    // ✅ NEW: Delete request (user can only request, admin can delete)
    deleteRequest: {
      requested: { type: Boolean, default: false },
      reason: { type: String, default: "" },
      requestedAt: { type: Date },
      requestedBy: { type: Schema.Types.ObjectId }, // store requester id (usually req.user.id)
    },
  },
  { timestamps: true }
);

// ✅ Hash password before save (async hook WITHOUT next)
StaffSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ✅ compare password helper
StaffSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.Staff || mongoose.model("Staff", StaffSchema);