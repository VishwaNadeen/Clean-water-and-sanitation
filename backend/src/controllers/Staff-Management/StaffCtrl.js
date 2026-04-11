import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { z } from "zod";
import cloudinary from "../../config/cloudinary.js";

import Staff from "../../models/Staff-Management/StaffModel.js";
import Login from "../../models/user-management/logInModel.js";
import User from "../../models/user-management/userModel.js";
import { sendEmail } from "../../services/sendEmail.js";
import { uploadBufferToCloudinary } from "../../utils/staff-Management/Staffcloudinary.js";

/* ---------------------------------------------
 * Helpers
 * --------------------------------------------- */
function fieldErrors(err) {
  if (!err?.errors) return undefined;
  const out = {};
  for (const [k, v] of Object.entries(err.errors)) out[k] = v.message;
  return out;
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitFullName(fullName) {
  const cleaned = String(fullName || "").trim().replace(/\s+/g, " ");
  const parts = cleaned.split(" ").filter(Boolean);

  const firstName = parts[0] || "Staff";
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "N/A";
  return { firstName, lastName };
}

const nicRegex = /^(?:\d{9}[VvXx]|\d{12})$/;
const countryCodeRegex = /^\+\d{1,4}$/;
const fullNameRegex = /^[A-Za-z\s]+$/;

function sanitizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function validatePhone(countryCode, phone) {
  const safeCountryCode = String(countryCode || "").trim();
  const digits = sanitizePhone(phone);

  if (!digits) return "Phone number is required";

  if (safeCountryCode === "+94") {
    if (!/^\d{9}$/.test(digits)) {
      return "Sri Lanka phone number must be exactly 9 digits with +94";
    }
    return "";
  }

  if (digits.length < 6 || digits.length > 15) {
    return "Phone number must be 6 to 15 digits";
  }

  return "";
}

// NOW req.user is Staff profile doc (because protect loads Staff by role=STAFF)
function getAuthUserId(req) {
  return String(req.user?._id || req.user?.id || "");
}

function isLoggedIn(req) {
  return Boolean(getAuthUserId(req));
}

function isAdmin(req) {
  return String(req.user?.role || "").toUpperCase() === "ADMIN";
}

function isSelf(req, staffId) {
  return getAuthUserId(req) === String(staffId);
}

/* ---------------------------------------------
 * Zod Validation Schemas (match StaffModel.js)
 * --------------------------------------------- */
const staffCreateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is too short")
    .max(80)
    .refine((v) => fullNameRegex.test(v), "Full name can contain letters and spaces only"),
  nic: z
    .string()
    .trim()
    .min(5, "NIC is too short")
    .max(20)
    .refine((v) => nicRegex.test(v), "NIC must be old format (123456789V) or 12-digit format"),

  countryCode: z
    .string()
    .trim()
    .min(2)
    .max(6)
    .refine((v) => countryCodeRegex.test(v), "Country code must be like +94")
    .optional()
    .default("+94"),

  phone: z.string().trim().regex(/^\d+$/, "Phone must contain only digits"),

  email: z.string().trim().toLowerCase().email("Invalid email"),

  role: z.enum(["Cleaner", "Supervisor", "Technician"]),
  status: z.enum(["Active", "Inactive", "OnLeave"]).optional(),

  gender: z.enum(["MALE", "FEMALE"]),

  baseProvince: z.string().trim().min(2).max(50),
  baseDistrict: z.string().trim().min(2).max(50),

  address: z.string().trim().min(3, "Address is too short").max(200),
  dob: z.coerce.date(),
  joinDate: z.coerce.date(),
});

const staffUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .refine((v) => fullNameRegex.test(v), "Full name can contain letters and spaces only")
    .optional(),
  nic: z
    .string()
    .trim()
    .min(5)
    .max(20)
    .refine((v) => nicRegex.test(v), "NIC must be old format (123456789V) or 12-digit format")
    .optional(),

  countryCode: z
    .string()
    .trim()
    .min(2)
    .max(6)
    .refine((v) => countryCodeRegex.test(v), "Country code must be like +94")
    .optional(),
  phone: z.string().trim().regex(/^\d+$/, "Phone must contain only digits").optional(),

  email: z.string().trim().toLowerCase().email().optional(),

  role: z.enum(["Cleaner", "Supervisor", "Technician"]).optional(),
  status: z.enum(["Active", "Inactive", "OnLeave"]).optional(),

  gender: z.enum(["MALE", "FEMALE"]).optional(),

  baseProvince: z.string().trim().min(2).max(50).optional(),
  baseDistrict: z.string().trim().min(2).max(50).optional(),

  address: z.string().trim().min(3).max(200).optional(),
  dob: z.coerce.date().optional(),
  joinDate: z.coerce.date().optional(),
});

const staffPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

const deleteRequestSchema = z.object({
  reason: z.string().trim().min(3, "Reason is too short").max(300).optional(),
});

async function sendStaffRegistrationEmail({ email, fullName, initialPassword, role }) {
  await sendEmail({
    to: email,
    subject: "Your Staff Account Has Been Created",
    text: `Hello ${fullName}, your staff account has been created. Role: ${role}. Login email: ${email}. Temporary password: ${initialPassword}. Please change it after your first login.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6;">
        <h2 style="margin-bottom: 12px;">Welcome to Clean Water & Sanitation</h2>
        <p>Hello ${fullName},</p>
        <p>Your staff account has been created successfully.</p>
        <p><strong>Role:</strong> ${role}</p>
        <p><strong>Login email:</strong> ${email}</p>
        <p><strong>Temporary password:</strong> ${initialPassword}</p>
        <p>For your first login, please use your NIC number as the password, then change it after signing in.</p>
      </div>
    `,
  });

  return true;
}

async function sendDeleteApprovalEmail({ email, fullName }) {
  await sendEmail({
    to: email,
    subject: "Your Profile Deletion Request Has Been Approved",
    text: `Hello ${fullName}, your profile deletion request has been approved by the staff manager/admin. Your staff profile will now be deleted from Clean Water & Sanitation.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6;">
        <h2 style="margin-bottom: 12px;">Profile Deletion Approved</h2>
        <p>Hello ${fullName},</p>
        <p>Your profile deletion request has been approved by the staff manager/admin.</p>
        <p>Your staff profile will now be removed from Clean Water & Sanitation.</p>
        <p>If you did not expect this action, please contact the administrator immediately.</p>
      </div>
    `,
  });

  return true;
}

async function sendDeleteRejectionEmail({ email, fullName, adminResponse }) {
  const safeResponse =
    String(adminResponse || "").trim() ||
    "Your profile deletion request was reviewed and rejected by admin.";

  await sendEmail({
    to: email,
    subject: "Your Profile Deletion Request Was Rejected",
    text: `Hello ${fullName}, your profile deletion request was reviewed and rejected by the staff manager/admin. Response: ${safeResponse}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6;">
        <h2 style="margin-bottom: 12px;">Profile Deletion Request Rejected</h2>
        <p>Hello ${fullName},</p>
        <p>Your profile deletion request was reviewed and rejected by the staff manager/admin.</p>
        <p><strong>Response:</strong> ${safeResponse}</p>
        <p>Your account remains active. You can review the update from your staff dashboard or profile.</p>
      </div>
    `,
  });

  return true;
}

/* ===================== CREATE STAFF ===================== */
export async function createStaff(req, res) {
  const parsed = staffCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      name: i.path.join("."),
      reason: i.message,
    }));
    return res.status(422).json({ message: "Validation failed", invalidParams: details });
  }

  const staffPayload = parsed.data;
  const phoneError = validatePhone(staffPayload.countryCode, staffPayload.phone);
  if (phoneError) {
    return res.status(422).json({
      message: "Validation failed",
      invalidParams: [{ name: "phone", reason: phoneError }],
    });
  }

  const initialPassword = staffPayload.nic.trim();
  const { firstName, lastName } = splitFullName(staffPayload.fullName);
  const normalizedEmail = staffPayload.email.toLowerCase().trim();

  try {
    const [existingStaffByEmail, existingStaffByNic, existingLoginByEmail] = await Promise.all([
      Staff.findOne({ email: normalizedEmail }).select("_id").lean(),
      Staff.findOne({ nic: staffPayload.nic.trim() }).select("_id").lean(),
      Login.findOne({ email: normalizedEmail }).select("_id userId").lean(),
    ]);

    let hasValidExistingLoginEmail = Boolean(existingLoginByEmail);

    // Auto-clean stale/orphan login rows so registration checks real existing accounts.
    if (existingLoginByEmail?.userId) {
      const [linkedStaff, linkedUser] = await Promise.all([
        Staff.findById(existingLoginByEmail.userId).select("_id").lean(),
        User.findById(existingLoginByEmail.userId).select("_id").lean(),
      ]);

      if (!linkedStaff && !linkedUser) {
        await Login.deleteOne({ _id: existingLoginByEmail._id });
        hasValidExistingLoginEmail = false;
      }
    }

    if (existingStaffByEmail || hasValidExistingLoginEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    if (existingStaffByNic) {
      return res.status(409).json({ message: "NIC already exists" });
    }

    const staff = await Staff.create({
      ...staffPayload,
      phone: Number(staffPayload.phone),
      email: normalizedEmail,
      password: initialPassword,
      mustChangePassword: true,
    });

    let loginCreated = false;

    try {
      const staffWithPw = await Staff.findById(staff._id).select("+password");
      if (!staffWithPw?.password) {
        throw new Error("Staff password not found for login creation");
      }

      await Login.create({
        userId: staff._id,
        firstName,
        lastName,
        email: staff.email,
        password: staffWithPw.password,
        role: "STAFF",
      });

      loginCreated = true;
    } catch (loginError) {
      await Staff.findByIdAndDelete(staff._id);

      if (loginError?.code === 11000) {
        return res.status(409).json({ message: "Email already exists" });
      }

      console.error("createStaff login creation failed:", loginError);
      return res.status(500).json({ message: "Failed to create staff login account" });
    }

    if (!loginCreated) {
      return res.status(500).json({ message: "Failed to create staff login account" });
    }

    let emailSent = false;

    try {
      emailSent = await sendStaffRegistrationEmail({
        email: staff.email,
        fullName: staff.fullName,
        initialPassword,
        role: staff.role,
      });
    } catch (emailError) {
      console.error("Staff registration email failed:", emailError.message);
    }

    return res.status(201).json({
      message: emailSent
        ? "Staff created and registration email sent"
        : "Staff created, but registration email could not be sent",
      staff,
      emailSent,
    });
  } catch (err) {
    if (err?.code === 11000) {
      const keys = err?.keyPattern || err?.keyValue || {};
      if (keys.email) return res.status(409).json({ message: "Email already exists" });
      if (keys.nic) return res.status(409).json({ message: "NIC already exists" });
      return res.status(409).json({ message: "Duplicate key error" });
    }

    console.error("❌ createStaff:", err);
    return res.status(400).json({
      message: "Invalid staff data",
      error: err.message,
      errors: fieldErrors(err),
    });
  }
}

/* ===================== LIST STAFF (ADMIN ONLY) ===================== */
export async function listStaff(req, res) {
  if (!isLoggedIn(req)) return res.status(401).json({ message: "Unauthorized" });
  if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden: admin only" });

  try {
    const { q, role, status, province, district } = req.query || {};
    const filter = {};

    if (q && String(q).trim() !== "") {
      const t = String(q).trim();
      const re = new RegExp(escapeRegex(t), "i");
      filter.$or = [{ fullName: re }, { nic: re }, { phone: re }, { email: re }];
    }

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (province) filter.baseProvince = province;
    if (district) filter.baseDistrict = district;

    const items = await Staff.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ results: items.length, staff: items });
  } catch (err) {
    console.error("❌ listStaff:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* ===================== GET MY PROFILE (TOKEN BASED) ===================== */
export async function getMyStaffProfile(req, res) {
  if (!isLoggedIn(req)) return res.status(401).json({ message: "Unauthorized" });

  const id = getAuthUserId(req);
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid staff id" });

  try {
    const staff = await Staff.findById(id).lean();
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    return res.status(200).json({ staff });
  } catch (err) {
    console.error("❌ getMyStaffProfile:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* ===================== GET ONE STAFF (PROFILE) ===================== */
export async function getStaffById(req, res) {
  if (!isLoggedIn(req)) return res.status(401).json({ message: "Unauthorized" });

  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid staff id" });

  if (!isAdmin(req) && !isSelf(req, id)) return res.status(403).json({ message: "Forbidden" });

  try {
    const staff = await Staff.findById(id).lean();
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    return res.status(200).json({ staff });
  } catch (err) {
    console.error("❌ getStaffById:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* ===================== UPDATE MY PROFILE (TOKEN BASED) ===================== */
export async function updateMyStaffProfile(req, res) {
  if (!isLoggedIn(req)) return res.status(401).json({ message: "Unauthorized" });

  const id = getAuthUserId(req);
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid staff id" });

  const parsed = staffUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({ name: i.path.join("."), reason: i.message }));
    return res.status(422).json({ message: "Validation failed", invalidParams: details });
  }

  try {
    if (typeof parsed.data.dob !== "undefined") {
      return res.status(400).json({ message: "Date of birth cannot be changed" });
    }

    if (typeof parsed.data.joinDate !== "undefined") {
      return res.status(400).json({ message: "Join date cannot be changed" });
    }

    if (typeof parsed.data.email !== "undefined") {
      return res.status(400).json({ message: "Email cannot be changed" });
    }

    const currentStaff = await Staff.findById(id).select("countryCode");
    if (!currentStaff) return res.status(404).json({ message: "Staff not found" });

    if (typeof parsed.data.phone !== "undefined") {
      const effectiveCountryCode = parsed.data.countryCode || currentStaff.countryCode || "+94";
      const phoneError = validatePhone(effectiveCountryCode, parsed.data.phone);
      if (phoneError) {
        return res.status(422).json({
          message: "Validation failed",
          invalidParams: [{ name: "phone", reason: phoneError }],
        });
      }
      parsed.data.phone = Number(parsed.data.phone);
    }

    const updated = await Staff.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Staff not found" });

    const loginUpdate = {};
    if (parsed.data.fullName) {
      const { firstName, lastName } = splitFullName(parsed.data.fullName);
      loginUpdate.firstName = firstName;
      loginUpdate.lastName = lastName;
    }
    if (Object.keys(loginUpdate).length > 0) {
      await Login.updateOne({ userId: updated._id }, { $set: loginUpdate });
    }

    return res.status(200).json({ message: "Staff updated", staff: updated });
  } catch (err) {
    if (err?.code === 11000) {
      const keys = err?.keyPattern || err?.keyValue || {};
      if (keys.email) return res.status(409).json({ message: "Email already exists" });
      if (keys.nic) return res.status(409).json({ message: "NIC already exists" });
      return res.status(409).json({ message: "Duplicate key error" });
    }

    console.error("❌ updateMyStaffProfile:", err);
    return res.status(400).json({ message: "Invalid staff data", error: err.message, errors: fieldErrors(err) });
  }
}

/* ===================== UPDATE STAFF (BY ID) ===================== */
export async function updateStaff(req, res) {
  if (!isLoggedIn(req)) return res.status(401).json({ message: "Unauthorized" });

  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid staff id" });

  if (!isAdmin(req) && !isSelf(req, id)) return res.status(403).json({ message: "Forbidden" });

  const parsed = staffUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({ name: i.path.join("."), reason: i.message }));
    return res.status(422).json({ message: "Validation failed", invalidParams: details });
  }

  try {
    if (typeof parsed.data.dob !== "undefined") {
      return res.status(400).json({ message: "Date of birth cannot be changed" });
    }

    if (typeof parsed.data.joinDate !== "undefined") {
      return res.status(400).json({ message: "Join date cannot be changed" });
    }

    if (typeof parsed.data.email !== "undefined") {
      return res.status(400).json({ message: "Email cannot be changed" });
    }

    const currentStaff = await Staff.findById(id).select("countryCode");
    if (!currentStaff) return res.status(404).json({ message: "Staff not found" });

    if (typeof parsed.data.phone !== "undefined") {
      const effectiveCountryCode = parsed.data.countryCode || currentStaff.countryCode || "+94";
      const phoneError = validatePhone(effectiveCountryCode, parsed.data.phone);
      if (phoneError) {
        return res.status(422).json({
          message: "Validation failed",
          invalidParams: [{ name: "phone", reason: phoneError }],
        });
      }
      parsed.data.phone = Number(parsed.data.phone);
    }

    const updated = await Staff.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Staff not found" });

    const loginUpdate = {};
    if (parsed.data.fullName) {
      const { firstName, lastName } = splitFullName(parsed.data.fullName);
      loginUpdate.firstName = firstName;
      loginUpdate.lastName = lastName;
    }
    if (Object.keys(loginUpdate).length > 0) {
      await Login.updateOne({ userId: updated._id }, { $set: loginUpdate });
    }

    return res.status(200).json({ message: "Staff updated", staff: updated });
  } catch (err) {
    if (err?.code === 11000) {
      const keys = err?.keyPattern || err?.keyValue || {};
      if (keys.email) return res.status(409).json({ message: "Email already exists" });
      if (keys.nic) return res.status(409).json({ message: "NIC already exists" });
      return res.status(409).json({ message: "Duplicate key error" });
    }

    console.error("❌ updateStaff:", err);
    return res.status(400).json({ message: "Invalid staff data", error: err.message, errors: fieldErrors(err) });
  }
}

/* ===================== UPDATE MY PASSWORD (TOKEN BASED) ===================== */
export async function updateMyStaffPassword(req, res) {
  if (!isLoggedIn(req)) return res.status(401).json({ message: "Unauthorized" });

  const id = getAuthUserId(req);
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid staff id" });

  const parsed = staffPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({ name: i.path.join("."), reason: i.message }));
    return res.status(422).json({ message: "Validation failed", invalidParams: details });
  }

  const { currentPassword, newPassword } = parsed.data;

  try {
    const staff = await Staff.findById(id).select("+password");
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    const ok = await bcrypt.compare(currentPassword, staff.password);
    if (!ok) return res.status(401).json({ message: "Current password is incorrect" });

    staff.password = newPassword;
    staff.mustChangePassword = false;
    await staff.save();

    await Login.updateOne({ userId: staff._id }, { $set: { password: staff.password } });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ updateMyStaffPassword:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* ===================== UPDATE STAFF PASSWORD (BY ID) ===================== */
export async function updateStaffPassword(req, res) {
  if (!isLoggedIn(req)) return res.status(401).json({ message: "Unauthorized" });

  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid staff id" });

  if (!isAdmin(req) && !isSelf(req, id)) return res.status(403).json({ message: "Forbidden" });

  const parsed = staffPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({ name: i.path.join("."), reason: i.message }));
    return res.status(422).json({ message: "Validation failed", invalidParams: details });
  }

  const { currentPassword, newPassword } = parsed.data;

  try {
    const staff = await Staff.findById(id).select("+password");
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    const ok = await bcrypt.compare(currentPassword, staff.password);
    if (!ok) return res.status(401).json({ message: "Current password is incorrect" });

    staff.password = newPassword;
    staff.mustChangePassword = false;
    await staff.save();

    await Login.updateOne({ userId: staff._id }, { $set: { password: staff.password } });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ updateStaffPassword:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* ===================== REQUEST DELETE MY PROFILE (TOKEN BASED) ===================== */
export async function requestMyDeleteProfile(req, res) {
  if (!isLoggedIn(req)) return res.status(401).json({ message: "Unauthorized" });

  const id = getAuthUserId(req);
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid staff id" });

  const parsed = deleteRequestSchema.safeParse(req.body || {});
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({ name: i.path.join("."), reason: i.message }));
    return res.status(422).json({ message: "Validation failed", invalidParams: details });
  }

  try {
    const staff = await Staff.findById(id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    staff.deleteRequest = {
      requested: true,
      reason: parsed.data.reason || "",
      requestedAt: new Date(),
      requestedBy: req.auth?._id, // ✅ Login id (auditable)
    };

    await staff.save();

    return res.status(200).json({
      message: "Delete request submitted. manager will review your request.",
      deleteRequest: staff.deleteRequest,
    });
  } catch (err) {
    console.error("❌ requestMyDeleteProfile:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* ===================== REQUEST DELETE PROFILE (BY ID) ===================== */
export async function requestDeleteProfile(req, res) {
  if (!isLoggedIn(req)) return res.status(401).json({ message: "Unauthorized" });

  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid staff id" });

  if (!isAdmin(req) && !isSelf(req, id)) return res.status(403).json({ message: "Forbidden" });

  const parsed = deleteRequestSchema.safeParse(req.body || {});
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({ name: i.path.join("."), reason: i.message }));
    return res.status(422).json({ message: "Validation failed", invalidParams: details });
  }

  try {
    const staff = await Staff.findById(id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    staff.deleteRequest = {
      requested: true,
      reason: parsed.data.reason || "",
      requestedAt: new Date(),
      requestedBy: req.auth?._id, // ✅ Login id
    };

    await staff.save();

    return res.status(200).json({
      message: "Delete request submitted. Admin will review your request.",
      deleteRequest: staff.deleteRequest,
    });
  } catch (err) {
    console.error("❌ requestDeleteProfile:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* ===================== REJECT DELETE REQUEST (ADMIN ONLY) ===================== */
export async function rejectDeleteRequest(req, res) {
  if (!isLoggedIn(req)) return res.status(401).json({ message: "Unauthorized" });
  if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden: only admin can reject delete requests" });

  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid staff id" });

  try {
    const staff = await Staff.findById(id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    if (!staff?.deleteRequest?.requested) {
      return res.status(400).json({ message: "No pending delete request found for this staff member" });
    }

    const adminResponse = "Your profile deletion request was reviewed and rejected by admin.";

    staff.deleteRequest = {
      requested: false,
      status: "rejected",
      reason: staff.deleteRequest?.reason || "",
      requestedAt: staff.deleteRequest?.requestedAt,
      requestedBy: staff.deleteRequest?.requestedBy,
      adminResponse,
      reviewedAt: new Date(),
      reviewedBy: req.auth?._id,
    };

    await staff.save();

    if (staff.email) {
      try {
        await sendDeleteRejectionEmail({
          email: staff.email,
          fullName: staff.fullName || "Staff member",
          adminResponse,
        });
      } catch (emailError) {
        console.error("Delete rejection email failed:", emailError.message);
      }
    }

    return res.status(200).json({
      message: "Delete request rejected successfully and staff member notified",
      staff,
    });
  } catch (err) {
    console.error("❌ rejectDeleteRequest:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* ===================== DELETE STAFF (ADMIN ONLY) ===================== */
export async function deleteStaff(req, res) {
  if (!isLoggedIn(req)) return res.status(401).json({ message: "Unauthorized" });
  if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden: only admin can delete profiles" });

  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid staff id" });

  try {
    const staff = await Staff.findById(id).lean();
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    if (!staff?.deleteRequest?.requested) {
      return res.status(400).json({ message: "Cannot delete: no delete request found for this profile" });
    }

    if (!staff.email) {
      return res.status(400).json({ message: "Cannot approve deletion: staff email is missing" });
    }

    try {
      await sendDeleteApprovalEmail({
        email: staff.email,
        fullName: staff.fullName || "Staff member",
      });
    } catch (emailError) {
      console.error("Delete approval email failed:", emailError.message);
      return res.status(500).json({
        message: "Delete approval email could not be sent. Profile was not deleted.",
      });
    }

    await Login.deleteOne({ userId: id });
    const deleted = await Staff.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Staff deleted by admin and notification email sent",
      staff: deleted,
    });
  } catch (err) {
    console.error("❌ deleteStaff:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function uploadMyStaffProfileImage(req, res) {
  if (!isLoggedIn(req)) return res.status(401).json({ message: "Unauthorized" });

  const id = getAuthUserId(req);
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid staff id" });
  if (!req.file) return res.status(400).json({ message: "Profile image is required" });

  try {
    const staff = await Staff.findById(id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    if (staff.profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(staff.profileImagePublicId);
      } catch (error) {
        console.error("Failed to remove previous profile image:", error.message);
      }
    }

    let result;
    if (process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_SECRET_KEY) {
      try {
        result = await uploadBufferToCloudinary(req.file.buffer, "staff-profile-images");
      } catch (cloudinaryError) {
        console.error("Profile image upload failed, using fallback:", cloudinaryError.message);
        const base64Image = req.file.buffer.toString("base64");
        result = {
          secure_url: `data:${req.file.mimetype};base64,${base64Image}`,
          public_id: `local_${Date.now()}_${req.file.originalname}`,
        };
      }
    } else {
      const base64Image = req.file.buffer.toString("base64");
      result = {
        secure_url: `data:${req.file.mimetype};base64,${base64Image}`,
        public_id: `local_${Date.now()}_${req.file.originalname}`,
      };
    }

    staff.profileImageUrl = result.secure_url || result.url || "";
    staff.profileImagePublicId = result.public_id || "";
    await staff.save();

    return res.status(200).json({
      message: "Profile image uploaded successfully",
      staff,
    });
  } catch (err) {
    console.error("uploadMyStaffProfileImage:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function removeMyStaffProfileImage(req, res) {
  if (!isLoggedIn(req)) return res.status(401).json({ message: "Unauthorized" });

  const id = getAuthUserId(req);
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid staff id" });

  try {
    const staff = await Staff.findById(id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    if (staff.profileImagePublicId && !staff.profileImagePublicId.startsWith("local_")) {
      try {
        await cloudinary.uploader.destroy(staff.profileImagePublicId);
      } catch (error) {
        console.error("Failed to remove profile image from cloudinary:", error.message);
      }
    }

    staff.profileImageUrl = "";
    staff.profileImagePublicId = "";
    await staff.save();

    return res.status(200).json({
      message: "Profile image removed successfully",
      staff,
    });
  } catch (err) {
    console.error("removeMyStaffProfileImage:", err);
    return res.status(500).json({ message: "Server error" });
  }
}


