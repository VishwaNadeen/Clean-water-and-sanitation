import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Login from "../models/logInModel.js";
import User from "../models/userModel.js";

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role }, // include role in token
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1️⃣ Check Login table (need password)
    const login = await Login.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (!login) {
      res.status(401);
      throw new Error("Invalid email or password.");
    }

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, login.password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password.");
    }

    // 3️⃣ Load User profile using userId
    const user = await User.findById(login.userId);

    if (!user) {
      res.status(401);
      throw new Error("User profile not found.");
    }

    if (user.status === "SUSPENDED") {
      res.status(403);
      throw new Error("Account is suspended.");
    }

    // 4️⃣ Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      message: "Login successful.",
      token: generateToken(user._id, login.role),
      role: login.role, // optional: send role separately
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