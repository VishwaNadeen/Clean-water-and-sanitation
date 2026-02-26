import User from "../../models/user-management/userModel.js";
import Login from "../../models/user-management/logInModel.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

/**
 * Helper function to send OTP email
 */
const sendOtpEmail = async (email, otp) => {
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
    subject: "Verify Your Email - OTP",
    html: `
      <h3>Email Verification</h3>
      <p>Your OTP code is:</p>
      <h2>${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
    `,
  });
};

/**
 * CREATE user profile (Register)
 * Public route (no token needed)
 */
export const createUserProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, countryCode, phone, gender, password } =
      req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !countryCode ||
      !phone ||
      !gender ||
      !password
    ) {
      res.status(400);
      throw new Error("All required fields must be provided.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(409);
      throw new Error("Email already exists.");
    }

    // 🔥 Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 10);

    // 1️⃣ Create User (password will be hashed by User model hook)
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      countryCode: countryCode.trim(),
      phone: phone.trim(),
      gender,
      password,
      status: "ACTIVE",
      isEmailVerified: false,
      emailOtpHash: otpHash,
      emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // 2️⃣ Create Login record (role must always be USER)
    await Login.create({
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      role: "USER",
    });

    // 3️⃣ Send OTP email
    await sendOtpEmail(user.email, otp);

    res.status(201).json({
      message:
        "User profile created successfully. OTP sent to email for verification.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        countryCode: user.countryCode,
        phone: user.phone,
        gender: user.gender,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * VIEW own profile
 * Private route (token required)
 */
export const viewMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        countryCode: user.countryCode,
        phone: user.phone,
        gender: user.gender,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * EDIT profile details + optional PASSWORD CHANGE
 * Private route (token required)
 */
export const editMyProfile = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      countryCode,
      phone,
      gender,
      email,
      role,
      currentPassword,
      newPassword,
    } = req.body;

    const needPassword = Boolean(currentPassword || newPassword);

    const user = needPassword
      ? await User.findById(req.user._id).select("+password")
      : await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    if (email && email !== user.email) {
      res.status(400);
      throw new Error("Email cannot be changed.");
    }

    if (role) {
      res.status(400);
      throw new Error("Role cannot be changed.");
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (countryCode) user.countryCode = countryCode.trim();
    if (phone) user.phone = phone.trim();
    if (gender) user.gender = gender;

    if (needPassword) {
      if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error(
          "To change password, provide currentPassword and newPassword."
        );
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(401);
        throw new Error("Current password is incorrect.");
      }

      user.password = newPassword;
    }

    await user.save();

    const updateLoginData = {
      firstName: user.firstName,
      lastName: user.lastName,
    };

    if (needPassword) {
      updateLoginData.password = user.password;
    }

    await Login.updateOne({ userId: user._id }, { $set: updateLoginData });

    const safeUser = await User.findById(req.user._id);

    res.json({
      message: "Profile updated successfully.",
      user: {
        id: safeUser._id,
        firstName: safeUser.firstName,
        lastName: safeUser.lastName,
        email: safeUser.email,
        countryCode: safeUser.countryCode,
        phone: safeUser.phone,
        gender: safeUser.gender,
        status: safeUser.status,
        isEmailVerified: safeUser.isEmailVerified,
        lastLoginAt: safeUser.lastLoginAt,
        createdAt: safeUser.createdAt,
        updatedAt: safeUser.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE own profile
 */
export const deleteMyProfile = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      res.status(400);
      throw new Error("Password is required to delete the profile.");
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Password is incorrect.");
    }

    await Login.deleteOne({ userId: user._id });
    await user.deleteOne();

    res.json({ message: "Profile deleted successfully." });
  } catch (err) {
    next(err);
  }
};

/**
 * GET all users (ADMIN only)
 * Private route
 */
export const getAllUsers = async (req, res, next) => {
  try {
    // Only ADMIN can access this route
    if (req.user.role !== "ADMIN") {
      res.status(403);
      throw new Error("Access denied. Admin only.");
    }

    // 1️⃣ Get all login records where role = USER
    const userLogins = await Login.find({ role: "USER" }).select("userId");

    const userIds = userLogins.map((login) => login.userId);

    // 2️⃣ Get only those users
    const users = await User.find({ _id: { $in: userIds } })
      .select("-password -emailOtpHash -refreshTokenHash");

    res.json({
      total: users.length,
      users,
    });
  } catch (err) {
    next(err);
  }
};