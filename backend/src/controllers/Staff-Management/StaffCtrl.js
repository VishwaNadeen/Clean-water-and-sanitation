import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { z } from "zod";
import cloudinary from "../../config/cloudinary.js";

import Staff from "../../models/Staff-Management/StaffModel.js";
import Login from "../../models/user-Management/logInModel.js";
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
  fullName: z.string().trim().min(2, "Full name is too short").max(80),
  nic: z.string().trim().min(5, "NIC is too short").max(20),

  countryCode: z.string().trim().min(2).max(6).optional().default("+94"),

  phone: z.coerce.number(),

  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),

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
  fullName: z.string().trim().min(2).max(80).optional(),
  nic: z.string().trim().min(5).max(20).optional(),

  countryCode: z.string().trim().min(2).max(6).optional(),
  phone: z.coerce.number().optional(),

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
  const { firstName, lastName } = splitFullName(staffPayload.fullName);

  try {
    const staff = await Staff.create({
      ...staffPayload,
      email: staffPayload.email.toLowerCase().trim(),
    });

    const staffWithPw = await Staff.findById(staff._id).select("+password");
    if (!staffWithPw?.password) {
      return res.status(500).json({ message: "Staff created but password not found for login creation" });
    }

    await Login.create({
      userId: staff._id,
      firstName,
      lastName,
      email: staff.email,
      password: staffWithPw.password,
      role: "STAFF",
    });

    return res.status(201).json({ message: "Staff created", staff });
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
    const updated = await Staff.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Staff not found" });

    const loginUpdate = {};
    if (parsed.data.fullName) {
      const { firstName, lastName } = splitFullName(parsed.data.fullName);
      loginUpdate.firstName = firstName;
      loginUpdate.lastName = lastName;
    }
    if (parsed.data.email) {
      loginUpdate.email = parsed.data.email.toLowerCase().trim();
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
    const updated = await Staff.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Staff not found" });

    const loginUpdate = {};
    if (parsed.data.fullName) {
      const { firstName, lastName } = splitFullName(parsed.data.fullName);
      loginUpdate.firstName = firstName;
      loginUpdate.lastName = lastName;
    }
    if (parsed.data.email) loginUpdate.email = parsed.data.email.toLowerCase().trim();

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
      message: "Delete request submitted. Admin will review your request.",
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

    await Login.deleteOne({ userId: id });
    const deleted = await Staff.findByIdAndDelete(id);

    return res.status(200).json({ message: "Staff deleted by admin", staff: deleted });
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
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_SECRET) {
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
