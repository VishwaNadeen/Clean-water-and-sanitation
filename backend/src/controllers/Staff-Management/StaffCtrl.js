// backend/controllers/StaffCtrl.js
import mongoose from "mongoose";
import { z } from "zod";
import Staff from "../../models/Staff-Management/StaffModel.js";

/* ---------------------------------------------
 * Helpers//If Mongoose throws validation errors, this converts them into a simple object.
 * --------------------------------------------- */
function fieldErrors(err) {
  // for mongoose validation errors (optional)
  if (!err?.errors) return undefined;
  const out = {};
  for (const [k, v] of Object.entries(err.errors)) out[k] = v.message;
  return out;
}

/* ---------------------------------------------
 * Zod Validation Schemas 
 * --------------------------------------------- */
const staffCreateSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is too short").max(80),
  nic: z.string().trim().min(5, "NIC is too short").max(20),
  phone: z.string().trim().min(8, "Phone too short").max(25),

  email: z.string().trim().toLowerCase().email().optional().or(z.literal("")),

  role: z.enum(["Cleaner", "Supervisor", "Technician"]),
  status: z.enum(["Active", "Inactive", "OnLeave"]).optional(),

  baseProvince: z.string().trim().min(2).max(50),
  baseDistrict: z.string().trim().min(2).max(50),

  
  address: z.string().trim().min(3, "Address is too short").max(200),
  dob: z.coerce.date(),      // accepts "2000-05-12" as Date
  joinDate: z.coerce.date(), // accepts "2026-02-20" as Date
});

const staffUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(80).optional(),
  nic: z.string().trim().min(5).max(20).optional(),
  phone: z.string().trim().min(8).max(25).optional(),

  email: z.string().trim().toLowerCase().email().optional().or(z.literal("")),

  role: z.enum(["Cleaner", "Supervisor", "Technician"]).optional(),
  status: z.enum(["Active", "Inactive", "OnLeave"]).optional(),

  baseProvince: z.string().trim().min(2).max(50).optional(),
  baseDistrict: z.string().trim().min(2).max(50).optional(),

  address: z.string().trim().min(3).max(200).optional(),
  dob: z.coerce.date().optional(),
  joinDate: z.coerce.date().optional(),
});

/* ===================== CREATE STAFF ===================== */
export async function createStaff(req, res) {
  try {
    // Validate request body
    const parsed = staffCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => ({
        name: i.path.join("."),
        reason: i.message,
      }));
      return res.status(422).json({ message: "Validation failed", invalidParams: details });
    }

    // Create staff (createdAt auto)
    const doc = await Staff.create(parsed.data);

    return res.status(201).json({ message: "Staff created", staff: doc });
  } catch (err) {
    // Duplicate NIC error
    if (err?.code === 11000) {
      return res.status(409).json({ message: "NIC already exists" });
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
// supports optional filters: ?q=kamal&role=Cleaner&status=Active&province=Western&district=Colombo
export async function listStaff(req, res) {
  try {
    const { q, role, status, province, district } = req.query || {};
    const filter = {};

    if (q && String(q).trim() !== "") {
      const t = String(q).trim();
      const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
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
    if (role) filter.role = role; // Cleaner / Technician

    const staff = await Staff.find(filter).sort({ fullName: 1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
/* ===================== UPDATE STAFF ===================== */
export async function updateStaff(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid staff id" });
  }

  // Validate update body
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

    return res.status(200).json({ message: "Staff updated", staff: updated });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "NIC already exists" });
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
    const deleted = await Staff.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Staff not found" });

    return res.status(200).json({ message: "Staff deleted", staff: deleted });
  } catch (err) {
    console.error("❌ deleteStaff:", err);
    return res.status(500).json({ message: "Server error" });
  }
}