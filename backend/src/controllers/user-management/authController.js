import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

import Login from "../../models/user-management/logInModel.js";
import User from "../../models/user-management/userModel.js";
import Staff from "../../models/Staff-Management/StaffModel.js";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// 🔐 Login (checks Login + User, and Login + Staff)
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1) Check login collection
    const login = await Login.findOne({ email: normalizedEmail }).select("+password");
    if (!login) {
      res.status(401);
      throw new Error("Invalid email or password.");
    }

    // 2) Compare password
    const match = await bcrypt.compare(password, login.password);
    if (!match) {
      res.status(401);
      throw new Error("Invalid email or password.");
    }

    // 3) Check user collection AND staff collection
    //    - first by ID (login.userId)
    //    - if not found, fallback by email
    let user = null;
    let staff = null;

    if (login.userId) {
      user = await User.findById(login.userId);
      staff = await Staff.findById(login.userId);
    }

    if (!user) {
      user = await User.findOne({ email: normalizedEmail });
    }

    if (!staff) {
      staff = await Staff.findOne({ email: normalizedEmail });
    }

    // 4) If neither found → profile not found
    if (!user && !staff) {
      res.status(404);
      throw new Error("User profile not found.");
    }

    // 5) Pick the profile (prefer role-based if possible, else pick whichever exists)
    let profile = null;

    if (login.role === "STAFF") {
      profile = staff || user;
    } else {
      profile = user || staff;
    }

    if (!profile) {
      res.status(404);
      throw new Error("User profile not found.");
    }

    // 6) Optional checks (do NOT break if fields don't exist)
    // Email verification (User model has it; Staff may not)
    if (typeof profile.isEmailVerified !== "undefined" && profile.isEmailVerified === false) {
      res.status(403);
      throw new Error("Please verify your email first.");
    }

    // Account suspension checks (handle both styles)
    const statusVal = (profile.status ?? "").toString().toUpperCase();
    if (statusVal === "SUSPENDED") {
      res.status(403);
      throw new Error("Account is suspended.");
    }

    // last login update (only if field exists)
    if ("lastLoginAt" in profile) {
      profile.lastLoginAt = new Date();
      await profile.save();
    }

    res.json({
      message: "Login successful",
      token: generateToken(profile._id, login.role),
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

    if (!email || !otp) {
      res.status(400);
      throw new Error("Email and OTP are required.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Email OTP verification is usually for User collection
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+emailOtpHash +emailOtpExpires"
    );

    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    if (!user.emailOtpHash || !user.emailOtpExpires) {
      res.status(400);
      throw new Error("OTP not found.");
    }

    if (user.emailOtpExpires.getTime() < Date.now()) {
      res.status(400);
      throw new Error("OTP expired.");
    }

    const valid = await bcrypt.compare(otp, user.emailOtpHash);
    if (!valid) {
      res.status(400);
      throw new Error("Invalid OTP.");
    }

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
    // NOTE: this assumes req.user is set by auth middleware.
    // Keeping your logic unchanged, only adding safety.
    if (!req.user?._id) {
      res.status(401);
      throw new Error("Not authorized.");
    }

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
    if (!email) {
      res.status(400);
      throw new Error("Email is required.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1) login collection lookup
    const login = await Login.findOne({ email: normalizedEmail });
    if (!login) {
      res.status(404);
      throw new Error("Email not found.");
    }

    // 2) find profile in User OR Staff
    let profile = null;

    if (login.userId) {
      profile = await User.findById(login.userId).select(
        "+passwordResetOtpHash +passwordResetOtpExpires"
      );
      if (!profile) {
        profile = await Staff.findById(login.userId).select(
          "+passwordResetOtpHash +passwordResetOtpExpires"
        );
      }
    }

    if (!profile) {
      // fallback by email
      profile = await User.findOne({ email: normalizedEmail }).select(
        "+passwordResetOtpHash +passwordResetOtpExpires"
      );
      if (!profile) {
        profile = await Staff.findOne({ email: normalizedEmail }).select(
          "+passwordResetOtpHash +passwordResetOtpExpires"
        );
      }
    }

    if (!profile) {
      res.status(404);
      throw new Error("User profile not found.");
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 10);

    profile.passwordResetOtpHash = otpHash;
    profile.passwordResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await profile.save();

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
    if (!email || !otp) {
      res.status(400);
      throw new Error("Email and OTP are required.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const login = await Login.findOne({ email: normalizedEmail });
    if (!login) {
      res.status(404);
      throw new Error("Email not found.");
    }

    // profile in User OR Staff
    let profile = null;

    if (login.userId) {
      profile = await User.findById(login.userId).select(
        "+passwordResetOtpHash +passwordResetOtpExpires"
      );
      if (!profile) {
        profile = await Staff.findById(login.userId).select(
          "+passwordResetOtpHash +passwordResetOtpExpires"
        );
      }
    }

    if (!profile) {
      profile = await User.findOne({ email: normalizedEmail }).select(
        "+passwordResetOtpHash +passwordResetOtpExpires"
      );
      if (!profile) {
        profile = await Staff.findOne({ email: normalizedEmail }).select(
          "+passwordResetOtpHash +passwordResetOtpExpires"
        );
      }
    }

    if (!profile || !profile.passwordResetOtpHash || !profile.passwordResetOtpExpires) {
      res.status(400);
      throw new Error("OTP not found.");
    }

    if (profile.passwordResetOtpExpires.getTime() < Date.now()) {
      res.status(400);
      throw new Error("OTP expired.");
    }

    const ok = await bcrypt.compare(otp, profile.passwordResetOtpHash);
    if (!ok) {
      res.status(400);
      throw new Error("Invalid OTP.");
    }

    res.json({ message: "Reset OTP verified successfully." });
  } catch (err) {
    next(err);
  }
};

// ✅ Reset Password
export const resetPasswordWithOtp = async (req, res, next) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      res.status(400);
      throw new Error("All fields are required.");
    }

    if (newPassword !== confirmPassword) {
      res.status(400);
      throw new Error("Passwords do not match.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const login = await Login.findOne({ email: normalizedEmail }).select("+password");
    if (!login) {
      res.status(404);
      throw new Error("Email not found.");
    }

    // profile in User OR Staff
    let profile = null;

    if (login.userId) {
      profile = await User.findById(login.userId).select(
        "+password +passwordResetOtpHash +passwordResetOtpExpires"
      );

      if (!profile) {
        profile = await Staff.findById(login.userId).select(
          "+password +passwordResetOtpHash +passwordResetOtpExpires"
        );
      }
    }

    if (!profile) {
      profile = await User.findOne({ email: normalizedEmail }).select(
        "+password +passwordResetOtpHash +passwordResetOtpExpires"
      );

      if (!profile) {
        profile = await Staff.findOne({ email: normalizedEmail }).select(
          "+password +passwordResetOtpHash +passwordResetOtpExpires"
        );
      }
    }

    if (!profile || !profile.passwordResetOtpHash || !profile.passwordResetOtpExpires) {
      res.status(400);
      throw new Error("OTP not found.");
    }

    if (profile.passwordResetOtpExpires.getTime() < Date.now()) {
      res.status(400);
      throw new Error("OTP expired.");
    }

    const ok = await bcrypt.compare(otp, profile.passwordResetOtpHash);
    if (!ok) {
      res.status(400);
      throw new Error("Invalid OTP.");
    }

    // update profile password (if profile has password field)
    profile.password = newPassword;
    profile.passwordResetOtpHash = undefined;
    profile.passwordResetOtpExpires = undefined;
    await profile.save();

    // update login password too (keep your behavior)
    await Login.updateOne(
      { _id: login._id },
      { $set: { password: profile.password } }
    );

    res.json({ message: "Password reset successful." });
  } catch (err) {
    next(err);
  }
};