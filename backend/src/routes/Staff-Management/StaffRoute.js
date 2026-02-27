import express from "express";
import {
  createStaff,
  listStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  requestDeleteProfile,
  updateStaffPassword
} from "../../controllers/Staff-Management/StaffCtrl.js";

import { protect, authorizeRoles }
from "../../middleware/authMiddleware.js";

const router = express.Router();

/* ================= LOGIN REQUIRED ================= */
router.use(protect); // ✅ require login for all routes

// Create staff
router.post("/", createStaff);

// List staff (admin recommended)
router.get("/", authorizeRoles("ADMIN"), listStaff);

// View profile
router.get("/:id", getStaffById);

// Update profile
router.put("/:id", updateStaff);
router.patch("/:id", updateStaff);

// Update password
router.patch("/:id/password", updateStaffPassword);

// Request delete profile
router.post("/:id/delete-request", requestDeleteProfile);

// ✅ ONLY ADMIN CAN DELETE
router.delete(
  "/:id",
  authorizeRoles("ADMIN"),
  deleteStaff
);

export default router;