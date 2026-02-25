import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Login from "../models/logInModel.js";
import User from "../models/userModel.js";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// 🔐 Login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const login = await Login.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (!login) throw new Error("Invalid email or password.");

    const match = await bcrypt.compare(password, login.password);
    if (!match) throw new Error("Invalid email or password.");

    const user = await User.findById(login.userId);

    if (!user.isEmailVerified) {
      res.status(403);
      throw new Error("Please verify your email first.");
    }

    if (user.status === "SUSPENDED") {
      res.status(403);
      throw new Error("Account is suspended.");
    }

    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      message: "Login successful",
      token: generateToken(user._id, login.role),
      role: login.role,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Verify OTP
export const verifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+emailOtpHash"
    );

    if (!user) throw new Error("User not found.");

    if (user.emailOtpExpires < Date.now()) {
      throw new Error("OTP expired.");
    }

    const valid = await bcrypt.compare(otp, user.emailOtpHash);
    if (!valid) throw new Error("Invalid OTP.");

    user.isEmailVerified = true;
    user.emailOtpHash = undefined;
    user.emailOtpExpires = undefined;

    await user.save();

    res.json({ message: "Email verified successfully." });
  } catch (err) {
    next(err);
  }
};