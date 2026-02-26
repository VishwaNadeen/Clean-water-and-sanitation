// backend/controllers/Staff-Management/StaffCtrl.js
import mongoose from "mongoose";
import { z } from "zod";

import Staff from "../../models/Staff-Management/StaffModel.js";
import Login from "../../models/user-Management/logInModel.js";

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

/* ---------------------------------------------
 * Zod Validation Schemas (match StaffModel.js)
 * --------------------------------------------- */
const staffCreateSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is too short").max(80),
  nic: z.string().trim().min(5, "NIC is too short").max(20),

  countryCode: z.string().trim().min(2).max(6).optional().default("+94"),

  // StaffModel phone is Number -> accept string/number and coerce to number
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

  // allow email update (and sync to Login)
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
    // ✅ 1) Create Staff first (password will be hashed by StaffModel pre-save hook)
    const staff = await Staff.create({
      ...staffPayload,
      email: staffPayload.email.toLowerCase().trim(),
    });

    // ✅ 2) Get hashed password from DB (because Staff.password is select:false)
    const staffWithPw = await Staff.findById(staff._id).select("+password");
    if (!staffWithPw?.password) {
      return res.status(500).json({ message: "Staff created but password not found for login creation" });
    }

    // ✅ 3) Create Login record (role always STAFF, cannot be changed)
    await Login.create({
      userId: staff._id,
      firstName,
      lastName,
      email: staff.email,
      password: staffWithPw.password, // hashed password
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

/* ===================== LIST STAFF ===================== */
export async function listStaff(req, res) {
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

/* ===================== GET ONE STAFF ===================== */
export async function getStaffById(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid staff id" });
  }

  try {
    const staff = await Staff.findById(id).lean();
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    return res.status(200).json({ staff });
  } catch (err) {
    console.error("❌ getStaffById:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export const getAllStaff = async (req, res) => {
  try {
    const { role } = req.query;

    const filter = {};
    if (role) filter.role = role;

    const staff = await Staff.find(filter).sort({ fullName: 1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== UPDATE STAFF ===================== */
export async function updateStaff(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid staff id" });
  }

  const parsed = staffUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      name: i.path.join("."),
      reason: i.message,
    }));
    return res.status(422).json({ message: "Validation failed", invalidParams: details });
  }

  try {
    const updated = await Staff.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Staff not found" });

    // Sync Login (name/email only). Role stays STAFF
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

    console.error("❌ updateStaff:", err);
    return res.status(400).json({
      message: "Invalid staff data",
      error: err.message,
      errors: fieldErrors(err),
    });
  }
}

/* ===================== DELETE STAFF ===================== */
export async function deleteStaff(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid staff id" });
  }

  try {
    await Login.deleteOne({ userId: id });
    const deleted = await Staff.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "Staff not found" });

    return res.status(200).json({ message: "Staff deleted", staff: deleted });
  } catch (err) {
    console.error("❌ deleteStaff:", err);
    return res.status(500).json({ message: "Server error" });
  }
}