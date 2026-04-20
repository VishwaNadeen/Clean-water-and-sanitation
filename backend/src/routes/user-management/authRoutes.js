import express from "express";
import {
  loginUser,
  googleLogin,
  facebookLogin,
  verifyEmailOtp,
  resendEmailOtp,
  logoutUser,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPasswordWithOtp,
} from "../../controllers/user-management/authController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

/**
 * CORE AUTH
 */
router.post("/login", loginUser);

/**
 * SOCIAL LOGIN
 */
router.post("/google", googleLogin);
router.post("/facebook", facebookLogin);

/**
 * EMAIL VERIFICATION
 */
router.post("/verify-otp", verifyEmailOtp);
router.post("/resend-verify-otp", resendEmailOtp);

/**
 * LOGOUT
 */
router.post("/logout", protect, logoutUser);

/**
 * PASSWORD RESET FLOW
 */
router.post("/forgot-password", requestPasswordResetOtp);
router.post("/forgot-password/verify-otp", verifyPasswordResetOtp);
router.post("/forgot-password/reset", resetPasswordWithOtp);

export default router;