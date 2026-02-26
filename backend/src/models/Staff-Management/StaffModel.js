import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const StaffSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    nic: { type: String, required: true, trim: true, unique: true },

    // ✅ NEW: country code (e.g., +94)
    countryCode: { type: String, required: true, trim: true, default: "+94" },

    phone: { type: Number, required: true, trim: true },

    // optional
    email: { type: String, trim: true, lowercase: true, default: "" },

    role: {
      type: String,
      enum: ["Cleaner", "Supervisor", "Technician"],
      required: true,
    },

    // ✅ NEW: gender
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
    dob: { type: Date, required: true }, // birthday
    joinDate: { type: Date, default: Date.now }, // joining date

    // ✅ NEW: password (hashed)
    password: { type: String, required: true, select: false },

    // optional link
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// ✅ Hash password before save (only if modified)
StaffSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Helper method to compare password
StaffSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.Staff || mongoose.model("Staff", StaffSchema);