import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import Login from "../models/user-management/logInModel.js";
import User from "../models/user-management/userModel.js";
import Staff from "../models/Staff-Management/StaffModel.js";

/**
 * 🔐 PROTECT MIDDLEWARE (Role-based profile attach)
 * 1) Verify JWT -> decoded.id must be Login._id
 * 2) Find Login document
 * 3) Based on Login.role:
 *    - USER  -> load User by Login.userId
 *    - STAFF -> load Staff by Login.userId
 *    - ADMIN -> load User by Login.userId (common) OR fallback to login itself
 *
 * Attaches:
 *   req.auth = loginDoc
 *   req.user = profileDoc (User/Staff)
 *   req.user.role = loginRole (uppercase)
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized. Token missing.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const loginId = decoded?.id;

    if (!loginId || !mongoose.isValidObjectId(String(loginId))) {
      res.status(401);
      throw new Error("Not authorized. Invalid token id.");
    }

    // ✅ 1) Must exist in Login collection
    const login = await Login.findById(loginId).select("-password");
    if (!login) {
      res.status(401);
      throw new Error("Login account not found.");
    }

    const loginRole = String(login.role || decoded.role || "").toUpperCase();

    // ✅ 2) Load profile based on role
    let profile = null;

    if (loginRole === "USER" || loginRole === "ADMIN") {
      profile = await User.findById(login.userId).select("-password");
      if (!profile && loginRole === "ADMIN") {
        // fallback: some projects keep admin only in Login
        profile = login;
      }
    } else if (loginRole === "STAFF") {
      profile = await Staff.findById(login.userId).select("-password");
    } else {
      res.status(401);
      throw new Error("Not authorized. Unknown role.");
    }

    if (!profile) {
      res.status(401);
      throw new Error("Profile not found for this login.");
    }

    // Attach
    req.auth = login;         // Login doc (useful sometimes)
    req.user = profile;       // Actual profile doc (User/Staff)
    req.user.role = loginRole;

    next();
  } catch (error) {
    res.status(401);
    next(error);
  }
};

/**
 * 🚫 ACCOUNT STATUS CHECK
 */
export const checkAccountStatus = (req, res, next) => {
  if (req.user?.status === "SUSPENDED") {
    res.status(403);
    return next(new Error("Account is suspended."));
  }
  next();
};

/**
 * 🔑 REQUIRE PASSWORD FOR DELETE
 */
export const requirePasswordForDelete = (req, res, next) => {
  if (!req.body.password) {
    res.status(400);
    return next(new Error("Password is required to delete account."));
  }
  next();
};

/**
 * 👮 ROLE AUTHORIZATION
 * Example: authorizeRoles("ADMIN")
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const allowed = roles.map((r) => String(r).toUpperCase());
    const current = String(req.user?.role || "").toUpperCase();

    if (!current || !allowed.includes(current)) {
      res.status(403);
      return next(new Error("Access denied. Insufficient permissions."));
    }
    next();
  };
};