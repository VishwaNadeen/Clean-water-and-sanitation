import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
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

    const login = await Login.findOne({ email: normalizedEmail }).select("+password");
    if (!login) throw new Error("Invalid email or password.");

    const match = await bcrypt.compare(password, login.password);
    if (!match) throw new Error("Invalid email or password.");

    const user = await User.findById(login.userId);
    if (!user) throw new Error("User profile not found.");

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

// ✅ Verify Email OTP
export const verifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+emailOtpHash +emailOtpExpires"
    );

    if (!user) throw new Error("User not found.");
    if (!user.emailOtpHash || !user.emailOtpExpires)
      throw new Error("OTP not found.");

    if (user.emailOtpExpires.getTime() < Date.now())
      throw new Error("OTP expired.");

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

export const logoutUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      refreshTokenHash: null,
    });

    res.json({ message: "Logged out successfully." });
  } catch (err) {
    next(err);
  }
};

// Helper
const sendResetOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Clean Water & Sanitation" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset OTP",
    html: `
      <h3>Password Reset</h3>
      <p>Your OTP code is:</p>
      <h2>${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
    `,
  });
};

// ✅ Forgot Password
export const requestPasswordResetOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("Email is required.");

    const normalizedEmail = email.toLowerCase().trim();

    const login = await Login.findOne({ email: normalizedEmail });
    if (!login) throw new Error("Email not found.");

    const user = await User.findById(login.userId).select(
      "+passwordResetOtpHash +passwordResetOtpExpires"
    );

    if (!user) throw new Error("User profile not found.");

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 10);

    user.passwordResetOtpHash = otpHash;
    user.passwordResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendResetOtpEmail(normalizedEmail, otp);

    res.json({ message: "Password reset OTP sent to your email." });
  } catch (err) {
    next(err);
  }
};

// ✅ Verify Reset OTP
export const verifyPasswordResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      throw new Error("Email and OTP are required.");

    const normalizedEmail = email.toLowerCase().trim();

    const login = await Login.findOne({ email: normalizedEmail });
    if (!login) throw new Error("Email not found.");

    const user = await User.findById(login.userId).select(
      "+passwordResetOtpHash +passwordResetOtpExpires"
    );

    if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpires)
      throw new Error("OTP not found.");

    if (user.passwordResetOtpExpires.getTime() < Date.now())
      throw new Error("OTP expired.");

    const ok = await bcrypt.compare(otp, user.passwordResetOtpHash);
    if (!ok) throw new Error("Invalid OTP.");

    res.json({ message: "Reset OTP verified successfully." });
  } catch (err) {
    next(err);
  }
};

// ✅ Reset Password
export const resetPasswordWithOtp = async (req, res, next) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword)
      throw new Error("All fields are required.");

    if (newPassword !== confirmPassword)
      throw new Error("Passwords do not match.");

    const normalizedEmail = email.toLowerCase().trim();

    const login = await Login.findOne({ email: normalizedEmail }).select("+password");
    if (!login) throw new Error("Email not found.");

    const user = await User.findById(login.userId).select(
      "+password +passwordResetOtpHash +passwordResetOtpExpires"
    );

    if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpires)
      throw new Error("OTP not found.");

    if (user.passwordResetOtpExpires.getTime() < Date.now())
      throw new Error("OTP expired.");

    const ok = await bcrypt.compare(otp, user.passwordResetOtpHash);
    if (!ok) throw new Error("Invalid OTP.");

    user.password = newPassword;
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpires = undefined;

    await user.save();

    await Login.updateOne(
      { _id: login._id },
      { $set: { password: user.password } }
    );

    res.json({ message: "Password reset successful." });
  } catch (err) {
    next(err);
  }
};