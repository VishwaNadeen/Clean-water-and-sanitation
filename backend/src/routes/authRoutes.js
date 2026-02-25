import express from "express";
import { loginUser, verifyEmailOtp } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/verify-otp", verifyEmailOtp);

export default router;