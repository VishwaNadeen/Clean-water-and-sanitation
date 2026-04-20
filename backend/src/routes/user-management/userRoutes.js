import express from "express";
import {
  createUserProfile,
  viewMyProfile,
  editMyProfile,
  deleteMyProfile,
  getAllUsers,
} from "../../controllers/user-management/userController.js";

import {
  protect,
  checkAccountStatus,
} from "../../middleware/authMiddleware.js";

import upload from "../../middleware/uploadMiddleware.js";

const router = express.Router();

// Create user profile (Register) - Public
router.post("/", upload.single("profilePhoto"), createUserProfile);

// View my profile - Private
router.get("/me", protect, checkAccountStatus, viewMyProfile);

// Edit my profile (includes password change, cannot change email) - Private
router.put(
  "/me",
  protect,
  checkAccountStatus,
  upload.single("profilePhoto"),
  editMyProfile
);

// Delete my profile - Private
router.delete(
  "/me",
  protect,
  checkAccountStatus,
  deleteMyProfile
);

router.get("/", protect, getAllUsers);

export default router;