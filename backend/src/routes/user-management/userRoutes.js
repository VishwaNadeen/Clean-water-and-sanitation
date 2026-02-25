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
  requirePasswordForDelete,
} from "../../middleware/user-management/authMiddleware.js";

const router = express.Router();

// Create user profile (Register) - Public
router.post("/", createUserProfile);

// View my profile - Private
router.get("/me", protect, checkAccountStatus, viewMyProfile);

// Edit my profile (includes password change, cannot change email) - Private
router.put("/me", protect, checkAccountStatus, editMyProfile);

// Delete my profile (requires password) - Private
router.delete(
  "/me",
  protect,
  checkAccountStatus,
  requirePasswordForDelete,
  deleteMyProfile
);

router.get("/", protect, getAllUsers);

export default router;