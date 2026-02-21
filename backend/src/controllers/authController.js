import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required.");
    }

    // need password -> select +password
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+password"
    );

    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password.");
    }

    if (user.status === "SUSPENDED") {
      res.status(403);
      throw new Error("Account is suspended.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password.");
    }

    // update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      message: "Login successful.",
      token: generateToken(user._id),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        countryCode: user.countryCode,
        phone: user.phone,
        gender: user.gender,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (err) {
    next(err);
  }
};