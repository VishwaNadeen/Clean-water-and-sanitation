import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

/**
 * 🔐 PROTECT MIDDLEWARE
 * Checks JWT token and attaches logged-in user to req.user
 * Also attaches role from token to req.user.role
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized. Token missing.");
    }

    // Verify token (token payload: { id, role })
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user (exclude password by default)
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error("User not found.");
    }

    // ✅ attach logged-in user
    req.user = user;

    // ✅ attach role from token (IMPORTANT for admin routes)
    req.user.role = decoded.role;

    next();
  } catch (error) {
    res.status(401);
    next(error);
  }
};

/**
 * 🚫 ACCOUNT STATUS CHECK
 * Blocks suspended accounts
 */
export const checkAccountStatus = (req, res, next) => {
  if (req.user.status === "SUSPENDED") {
    res.status(403);
    return next(new Error("Account is suspended."));
  }
  next();
};

/**
 * 🔑 REQUIRE PASSWORD FOR DELETE
 * Ensures password field exists in delete request
 */
export const requirePasswordForDelete = (req, res, next) => {
  if (!req.body.password) {
    res.status(400);
    return next(new Error("Password is required to delete account."));
  }
  next();
};

/**
 * 👮 OPTIONAL ROLE AUTHORIZATION
 * Example: authorizeRoles("ADMIN")
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user.role || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error("Access denied. Insufficient permissions."));
    }
    next();
  };
};