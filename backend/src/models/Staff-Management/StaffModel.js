import mongoose from "mongoose";

const { Schema } = mongoose;

const StaffSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    nic: { type: String, required: true, trim: true, unique: true },
    phone: { type: String, required: true, trim: true },

    // optional
    email: { type: String, trim: true, lowercase: true, default: "" },

    role: {
      type: String,
      enum: ["Cleaner", "Supervisor", "Technician"],
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "OnLeave"],
      default: "Active",
    },

    baseProvince: { type: String, required: true, trim: true },
    baseDistrict: { type: String, required: true, trim: true },

    // ✅ NEW fields
    address: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },      // birthday
    joinDate: { type: Date,  default: Date.now}, // joining date

    // optional link
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Staff || mongoose.model("Staff", StaffSchema);