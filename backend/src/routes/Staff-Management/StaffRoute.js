import express from "express";
import {
  createStaff,
  listStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  rejectDeleteRequest,
  requestDeleteProfile,
  updateStaffPassword,

  // ✅ token-based (no id)
  getMyStaffProfile,
  updateMyStaffProfile,
  uploadMyStaffProfileImage,
  removeMyStaffProfileImage,
  updateMyStaffPassword,
  requestMyDeleteProfile,
} from "../../controllers/Staff-Management/StaffCtrl.js";

import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";
import upload from "../../middleware/StaffUploadImg.js";

const router = express.Router();

/* ================= LOGIN REQUIRED ================= */
router.use(protect);

// ✅ staff self endpoints (NO user id)
router.get("/me", getMyStaffProfile);
router.put("/me", updateMyStaffProfile);
router.patch("/me", updateMyStaffProfile);
router.post("/me/profile-image", upload.single("profileImage"), uploadMyStaffProfileImage);
router.delete("/me/profile-image", removeMyStaffProfileImage);
router.patch("/me/password", updateMyStaffPassword);
router.post("/me/delete-request", requestMyDeleteProfile);

// Create staff
router.post("/", authorizeRoles("ADMIN"), createStaff);

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
router.patch("/:id/delete-request/reject", authorizeRoles("ADMIN"), rejectDeleteRequest);

// ✅ ONLY ADMIN CAN DELETE
router.delete("/:id", authorizeRoles("ADMIN"), deleteStaff);

export default router;
