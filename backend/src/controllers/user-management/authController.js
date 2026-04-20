import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

import Login from "../../models/user-management/logInModel.js";
import User from "../../models/user-management/userModel.js";
import Staff from "../../models/Staff-Management/StaffModel.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// token payload: { id: LOGIN_ID, role, profileId }
const generateToken = (loginId, role, profileId) => {
  return jwt.sign(
    { id: loginId, role, profileId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const sendEmailVerificationOtp = async (email, otp) => {
  const transporter = createTransporter();

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

const sendResetOtpEmail = async (email, otp) => {
  const transporter = createTransporter();

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

const splitName = (name = "") => {
  const clean = String(name || "").trim();

  if (!clean) {
    return { firstName: "User", lastName: "Account" };
  }

  const parts = clean.split(/\s+/);

  return {
    firstName: parts[0] || "User",
    lastName: parts.slice(1).join(" ") || "Account",
  };
};

const resolveProfileFromLogin = async (login, normalizedEmail) => {
  let user = null;
  let staff = null;

  if (login?.userId) {
    user = await User.findById(login.userId);
    staff = await Staff.findById(login.userId);
  }

  if (!user) {
    user = await User.findOne({ email: normalizedEmail });
  }

  if (!staff) {
    staff = await Staff.findOne({ email: normalizedEmail });
  }

  if (!user && !staff) {
    return null;
  }

  if (String(login.role).toUpperCase() === "STAFF") {
    return staff || user;
  }

  return user || staff;
};

const ensureProfileCanLogin = (profile) => {
  if (!profile) return;

  if (
    typeof profile.isEmailVerified !== "undefined" &&
    profile.isEmailVerified === false
  ) {
    const error = new Error("Please verify your email first.");
    error.statusCode = 403;
    throw error;
  }

  const statusVal = (profile.status ?? "").toString().toUpperCase();
  if (statusVal === "SUSPENDED") {
    const error = new Error("Account is suspended.");
    error.statusCode = 403;
    throw error;
  }
};

const updateLastLogin = async (profile) => {
  if (profile && "lastLoginAt" in profile) {
    profile.lastLoginAt = new Date();
    await profile.save();
  }
};

const buildAuthResponse = (login, profile) => {
  const fullName =
    `${profile?.firstName || login.firstName || ""} ${
      profile?.lastName || login.lastName || ""
    }`.trim() || "User";

  return {
    message: "Login successful",
    token: generateToken(login._id, login.role, login.userId),
    role: login.role,
    id: profile?._id || login.userId,
    profileId: profile?._id || login.userId,
    email: login.email,
    fullName,
    username: fullName,
    authProvider: login.authProvider || "local",
    mustChangePassword: Boolean(profile?.mustChangePassword),
  };
};

const findOrCreateSocialAccount = async ({
  provider,
  providerId,
  email,
  firstName,
  lastName,
  profilePhotoUrl = "",
}) => {
  let user = await User.findOne({
    $or: [
      { email },
      provider === "google"
        ? { googleId: providerId }
        : { facebookId: providerId },
    ],
  });

  if (!user) {
    user = await User.create({
      firstName,
      lastName,
      email,
      countryCode: "",
      phone: "",
      gender: "OTHER",
      authProvider: provider,
      googleId: provider === "google" ? providerId : "",
      facebookId: provider === "facebook" ? providerId : "",
      status: "ACTIVE",
      isEmailVerified: true,
      profilePhotoUrl,
    });
  } else {
    if (!user.firstName) user.firstName = firstName;
    if (!user.lastName) user.lastName = lastName;
    if (!user.profilePhotoUrl) user.profilePhotoUrl = profilePhotoUrl;

    user.isEmailVerified = true;
    user.authProvider = provider;

    if (provider === "google") {
      user.googleId = providerId;
    }

    if (provider === "facebook") {
      user.facebookId = providerId;
    }

    await user.save();
  }

  let login = await Login.findOne({
    $or: [
      { email },
      provider === "google"
        ? { googleId: providerId }
        : { facebookId: providerId },
    ],
  });

  if (!login) {
    login = await Login.create({
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: "USER",
      authProvider: provider,
      googleId: provider === "google" ? providerId : "",
      facebookId: provider === "facebook" ? providerId : "",
    });
  } else {
    login.userId = login.userId || user._id;
    login.firstName = login.firstName || user.firstName;
    login.lastName = login.lastName || user.lastName;
    login.authProvider = provider;

    if (provider === "google") {
      login.googleId = providerId;
    }

    if (provider === "facebook") {
      login.facebookId = providerId;
    }

    await login.save();
  }

  return { user, login };
};

const createFacebookAppSecretProof = (accessToken) => {
  return crypto
    .createHmac("sha256", process.env.FACEBOOK_APP_SECRET)
    .update(accessToken)
    .digest("hex");
};

// Login (checks Login + User, and Login + Staff)
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const login = await Login.findOne({ email: normalizedEmail }).select(
      "+password"
    );
    if (!login) {
      res.status(401);
      throw new Error("Invalid email or password.");
    }

    if (!login.password) {
      res.status(400);
      throw new Error("This account uses Google or Facebook login.");
    }

    const match = await bcrypt.compare(password, login.password);
    if (!match) {
      res.status(401);
      throw new Error("Invalid email or password.");
    }

    const profile = await resolveProfileFromLogin(login, normalizedEmail);

    if (!profile) {
      res.status(404);
      throw new Error("User profile not found.");
    }

    try {
      ensureProfileCanLogin(profile);
    } catch (error) {
      res.status(error.statusCode || 403);
      throw error;
    }

    await updateLastLogin(profile);

    res.json(buildAuthResponse(login, profile));
  } catch (err) {
    next(err);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400);
      throw new Error("Google credential is required.");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      res.status(400);
      throw new Error("Google account email is required.");
    }

    const normalizedEmail = String(payload.email).toLowerCase().trim();
    const providerId = String(payload.sub || "");
    const nameParts = splitName(payload.name || "");

    const firstName = payload.given_name || nameParts.firstName;
    const lastName = payload.family_name || nameParts.lastName;
    const profilePhotoUrl = payload.picture || "";

    const { user, login } = await findOrCreateSocialAccount({
      provider: "google",
      providerId,
      email: normalizedEmail,
      firstName,
      lastName,
      profilePhotoUrl,
    });

    ensureProfileCanLogin(user);
    await updateLastLogin(user);

    res.json(buildAuthResponse(login, user));
  } catch (err) {
    next(err);
  }
};

export const facebookLogin = async (req, res, next) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      res.status(400);
      throw new Error("Facebook access token is required.");
    }

    if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
      res.status(500);
      throw new Error("Facebook login is not configured on the server.");
    }

    const appsecret_proof = createFacebookAppSecretProof(accessToken);

    const profileResponse = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,first_name,last_name,email,picture.type(large)&access_token=${encodeURIComponent(
        accessToken
      )}&appsecret_proof=${encodeURIComponent(appsecret_proof)}`
    );

    const profileData = await profileResponse.json();

    if (!profileResponse.ok || profileData?.error) {
      res.status(401);
      throw new Error(
        profileData?.error?.message || "Failed to fetch Facebook profile."
      );
    }

    const facebookUserId = String(profileData?.id || "").trim();

    if (!facebookUserId) {
      res.status(400);
      throw new Error("Facebook user id not found.");
    }

    if (!profileData?.email) {
      res.status(400);
      throw new Error(
        "Facebook email is not available. Make sure the Facebook app is in Live mode, email permission is enabled, and the account has granted email access."
      );
    }

    const normalizedEmail = String(profileData.email).toLowerCase().trim();
    const nameParts = splitName(profileData.name || "");

    const firstName = profileData.first_name || nameParts.firstName;
    const lastName = profileData.last_name || nameParts.lastName;
    const profilePhotoUrl = profileData?.picture?.data?.url || "";

    const { user, login } = await findOrCreateSocialAccount({
      provider: "facebook",
      providerId: facebookUserId,
      email: normalizedEmail,
      firstName,
      lastName,
      profilePhotoUrl,
    });

    ensureProfileCanLogin(user);
    await updateLastLogin(user);

    res.json(buildAuthResponse(login, user));
  } catch (err) {
    next(err);
  }
};

// Verify Email OTP
export const verifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400);
      throw new Error("Email and OTP are required.");
    }

    const normalizedEmail = email.toLowerCase().trim();

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

export const resendEmailOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error("Email is required.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+emailOtpHash +emailOtpExpires"
    );

    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    if (user.isEmailVerified) {
      res.status(400);
      throw new Error("Email is already verified.");
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 10);

    user.emailOtpHash = otpHash;
    user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmailVerificationOtp(normalizedEmail, otp);

    res.json({ message: "OTP resent successfully." });
  } catch (err) {
    next(err);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
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

// Forgot Password
export const requestPasswordResetOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error("Email is required.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const login = await Login.findOne({ email: normalizedEmail });
    if (!login) {
      res.status(404);
      throw new Error("Email not found.");
    }

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

    if (
      !profile ||
      !profile.passwordResetOtpHash ||
      !profile.passwordResetOtpExpires
    ) {
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

    const login = await Login.findOne({ email: normalizedEmail }).select(
      "+password"
    );
    if (!login) {
      res.status(404);
      throw new Error("Email not found.");
    }

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

    if (
      !profile ||
      !profile.passwordResetOtpHash ||
      !profile.passwordResetOtpExpires
    ) {
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

    profile.password = newPassword;
    profile.passwordResetOtpHash = undefined;
    profile.passwordResetOtpExpires = undefined;
    await profile.save();

    await Login.updateOne({ _id: login._id }, { $set: { password: profile.password } });

    res.json({ message: "Password reset successful." });
  } catch (err) {
    next(err);
  }
};