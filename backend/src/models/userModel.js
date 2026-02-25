import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    countryCode: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE"],
      required: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
    },

    // ✅ OTP Fields
    emailOtpHash: {
      type: String,
      select: false,
    },

    emailOtpExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

// 🔐 Hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;