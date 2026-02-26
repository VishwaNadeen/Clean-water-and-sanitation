import express from "express";
import { loginUser, 
    verifyEmailOtp,
    logoutUser,
    requestPasswordResetOtp, 
    verifyPasswordResetOtp, 
    resetPasswordWithOtp, } from "../../controllers/user-management/authController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/verify-otp", verifyEmailOtp);
router.post("/logout", protect, logoutUser);

// Forgot password OTP flow
router.post("/forgot-password", requestPasswordResetOtp);
router.post("/forgot-password/verify-otp", verifyPasswordResetOtp);
router.post("/forgot-password/reset", resetPasswordWithOtp);

export default router;