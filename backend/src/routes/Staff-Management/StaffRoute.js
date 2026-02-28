import express from "express";
import {
  createStaff,
  listStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  requestDeleteProfile,
  updateStaffPassword,

  // ✅ token-based (no id)
  getMyStaffProfile,
  updateMyStaffProfile,
  updateMyStaffPassword,
  requestMyDeleteProfile,
} from "../../controllers/Staff-Management/StaffCtrl.js";

import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";

const router = express.Router();

/* ================= LOGIN REQUIRED ================= */
router.use(protect);

// ✅ staff self endpoints (NO user id)
router.get("/me", getMyStaffProfile);
router.patch("/me", updateMyStaffProfile);
router.patch("/me/password", updateMyStaffPassword);
router.post("/me/delete-request", requestMyDeleteProfile);

// Create staff (keep as-is)
router.post("/", createStaff, authorizeRoles("ADMIN"));

// ✅ ADMIN ONLY: get all staff + search
router.get("/", authorizeRoles("ADMIN"), listStaff);

// View profile by id (admin or self)
router.get("/:id", getStaffById);

// Update profile by id (admin or self)
router.put("/:id", updateStaff);
router.patch("/:id", updateStaff);

// Update password by id (admin or self)
router.patch("/:id/password", updateStaffPassword);

// Request delete by id (admin or self)
router.post("/:id/delete-request", requestDeleteProfile);

// ✅ ONLY ADMIN CAN DELETE
router.delete("/:id", authorizeRoles("ADMIN"), deleteStaff);

export default router;