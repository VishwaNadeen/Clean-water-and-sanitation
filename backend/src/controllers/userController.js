import User from "../models/userModel.js";

/**
 * CREATE user profile (Register)
 * Public route (no token needed)
 * Body: firstName, lastName, email, countryCode, phone, gender, password
 */
export const createUserProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, countryCode, phone, gender, password } =
      req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !countryCode ||
      !phone ||
      !gender ||
      !password
    ) {
      res.status(400);
      throw new Error("All required fields must be provided.");
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(409);
      throw new Error("Email already exists.");
    }

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      countryCode: countryCode.trim(),
      phone: phone.trim(),
      gender,
      password, // will be hashed by pre-save hook
      status: "ACTIVE",
      isEmailVerified: false,
    });

    // Never return password
    res.status(201).json({
      message: "User profile created successfully.",
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * VIEW own profile
 * Private route (token required)
 */
export const viewMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id); // password not selected by default
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    res.json({
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * EDIT profile details + optional PASSWORD CHANGE
 * Private route (token required)
 * Rules:
 *  - Email cannot be changed
 *  - Password change requires currentPassword + newPassword
 * Body can include: firstName, lastName, countryCode, phone, gender
 * Optional: currentPassword, newPassword
 */
export const editMyProfile = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      countryCode,
      phone,
      gender,
      email, // should be ignored
      currentPassword,
      newPassword,
    } = req.body;

    // Need password field only if we are changing password
    const needPassword = Boolean(currentPassword || newPassword);

    const user = needPassword
      ? await User.findById(req.user._id).select("+password")
      : await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    // ❌ Do not allow email change
    if (email && email !== user.email) {
      res.status(400);
      throw new Error("Email cannot be changed.");
    }

    // ✅ Update basic fields (if provided)
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (countryCode) user.countryCode = countryCode.trim();
    if (phone) user.phone = phone.trim();
    if (gender) user.gender = gender;

    // ✅ Password change (optional)
    if (needPassword) {
      if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error(
          "To change password, provide currentPassword and newPassword."
        );
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(401);
        throw new Error("Current password is incorrect.");
      }

      user.password = newPassword; // will be hashed by pre-save hook
    }

    await user.save();

    // Return safe fields
    const safeUser = await User.findById(req.user._id);

    res.json({
      message: "Profile updated successfully.",
      user: {
        id: safeUser._id,
        firstName: safeUser.firstName,
        lastName: safeUser.lastName,
        email: safeUser.email, // unchanged
        countryCode: safeUser.countryCode,
        phone: safeUser.phone,
        gender: safeUser.gender,
        status: safeUser.status,
        isEmailVerified: safeUser.isEmailVerified,
        lastLoginAt: safeUser.lastLoginAt,
        createdAt: safeUser.createdAt,
        updatedAt: safeUser.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE own profile (password required)
 * Private route (token required)
 * Body: password
 */
export const deleteMyProfile = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      res.status(400);
      throw new Error("Password is required to delete the profile.");
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Password is incorrect.");
    }

    await user.deleteOne();

    res.json({ message: "Profile deleted successfully." });
  } catch (err) {
    next(err);
  }
};