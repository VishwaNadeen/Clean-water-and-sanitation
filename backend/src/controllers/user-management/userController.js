import User from "../../models/user-management/userModel.js";
import Login from "../../models/user-management/logInModel.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { z } from "zod";
import cloudinary from "../../config/cloudinary.js";

// Zod helpers
const zodFieldErrors = (zodError) => {
  const out = {};
  const issues = zodError?.issues || [];
  for (const issue of issues) {
    const key = issue.path?.length ? issue.path.join(".") : "body";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
};

const validate = (schema, data) => {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const err = new Error("Validation failed.");
    err.statusCode = 400;
    err.fieldErrors = zodFieldErrors(parsed.error);
    throw err;
  }
  return parsed.data;
};

// Common validators
const emailLowercaseSchema = z
  .string({ required_error: "Email is required." })
  .trim()
  .min(6, "Email is too short.")
  .max(254, "Email is too long.")
  .refine(
    (v) => v === v.toLowerCase(),
    "Email must contain only lowercase letters."
  )
  .regex(
    /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
    "Email must contain only lowercase letters and numbers (example: name123@gmail.com)"
  );

const phoneSchema = z
  .string({ required_error: "Phone is required." })
  .trim()
  .regex(/^\d+$/, "Phone must contain only numbers.")
  .max(15, "Phone number must be maximum 15 digits.")
  .min(9, "Phone number is too short.");

const genderSchema = z.enum(["MALE", "FEMALE", "OTHER"], {
  required_error: "Gender is required.",
});

const passwordSchema = z
  .string({ required_error: "Password is required." })
  .min(6, "Password must be at least 6 characters.")
  .max(12, "Password must be at most 12 characters.")
  .refine((v) => /[a-z]/.test(v), "Password must include a lowercase letter.")
  .refine((v) => /[A-Z]/.test(v), "Password must include an uppercase letter.")
  .refine((v) => /\d/.test(v), "Password must include a number.")
  .refine(
    (v) => /[^A-Za-z0-9]/.test(v),
    "Password must include a special character."
  );

const countryCodeSchema = z
  .string({ required_error: "Country code is required." })
  .trim()
  .regex(/^\+\d{1,4}$/, "Country code must be like +94.");

const nameSchema = z
  .string()
  .trim()
  .min(2, "Must be at least 2 characters.")
  .max(50, "Must be at most 50 characters.")
  .regex(/^[A-Za-z\s.'-]+$/, "Only letters and basic punctuation allowed.");

const optionalTextSchema = z
  .union([z.string(), z.undefined(), z.null()])
  .transform((v) => (typeof v === "string" ? v.trim() : ""))
  .refine((v) => v.length <= 100, "Must be at most 100 characters.");

const optionalAddressLineSchema = z
  .union([z.string(), z.undefined(), z.null()])
  .transform((v) => (typeof v === "string" ? v.trim() : ""))
  .refine((v) => v.length <= 150, "Must be at most 150 characters.");

const optionalDobSchema = z
  .union([z.string(), z.undefined(), z.null()])
  .transform((v) => {
    if (!v || !String(v).trim()) return undefined;
    return String(v).trim();
  })
  .refine((v) => !v || !Number.isNaN(new Date(v).getTime()), "Invalid date of birth.");

const createUserProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailLowercaseSchema,
  countryCode: countryCodeSchema,
  phone: phoneSchema,
  gender: genderSchema,
  password: passwordSchema,
  dob: optionalDobSchema.optional(),
  addressLine1: optionalAddressLineSchema.optional(),
  addressLine2: optionalAddressLineSchema.optional(),
  addressLine3: optionalAddressLineSchema.optional(),
  country: optionalTextSchema.optional(),
  provinceState: optionalTextSchema.optional(),
  district: optionalTextSchema.optional(),
  city: optionalTextSchema.optional(),
});

const editMyProfileSchema = z
  .object({
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
    countryCode: countryCodeSchema.optional(),
    phone: phoneSchema.optional(),
    gender: genderSchema.optional(),

    dob: optionalDobSchema.optional(),
    addressLine1: optionalAddressLineSchema.optional(),
    addressLine2: optionalAddressLineSchema.optional(),
    addressLine3: optionalAddressLineSchema.optional(),
    country: optionalTextSchema.optional(),
    provinceState: optionalTextSchema.optional(),
    district: optionalTextSchema.optional(),
    city: optionalTextSchema.optional(),

    email: emailLowercaseSchema.optional(),
    role: z.string().optional(),

    currentPassword: z.string().min(1, "currentPassword cannot be empty.").optional(),
    newPassword: passwordSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const needPassword = Boolean(data.currentPassword || data.newPassword);

    if (needPassword) {
      if (!data.currentPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["currentPassword"],
          message: "currentPassword is required to change password.",
        });
      }

      if (!data.newPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["newPassword"],
          message: "newPassword is required to change password.",
        });
      }
    }
  });

const deleteMyProfileSchema = z.object({
  password: z
    .string({ required_error: "Password is required." })
    .min(1, "Password is required."),
});

const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Clean Water & Sanitation" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email - OTP",
    html: `
      <h3>Email Verification</h3>
      <p>Your OTP code is:</p>
      <h2>${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
    `,
  });
};

const uploadBufferToCloudinary = (buffer, folder = "user-management/profile-photos") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });

const buildSafeUserResponse = (user) => ({
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
  profilePhotoUrl: user.profilePhotoUrl || "",
  profilePhotoPublicId: user.profilePhotoPublicId || "",
  dob: user.dob,
  address: {
    line1: user.address?.line1 || "",
    line2: user.address?.line2 || "",
    line3: user.address?.line3 || "",
  },
  country: user.country || "",
  provinceState: user.provinceState || "",
  district: user.district || "",
  city: user.city || "",
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * CREATE user profile (Register)
 * Public route
 */
export const createUserProfile = async (req, res, next) => {
  try {
    const body = validate(createUserProfileSchema, req.body);

    const {
      firstName,
      lastName,
      email,
      countryCode,
      phone,
      gender,
      password,
      dob,
      addressLine1,
      addressLine2,
      addressLine3,
      country,
      provinceState,
      district,
      city,
    } = body;

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(409);
      throw new Error("Email already exists.");
    }

    let uploadedPhoto = null;

    if (req.file) {
      uploadedPhoto = await uploadBufferToCloudinary(req.file.buffer);
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 10);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      countryCode: countryCode.trim(),
      phone: phone.trim(),
      gender,
      password,
      status: "ACTIVE",
      isEmailVerified: false,
      emailOtpHash: otpHash,
      emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
      profilePhotoUrl: uploadedPhoto?.secure_url || "",
      profilePhotoPublicId: uploadedPhoto?.public_id || "",
      dob: dob ? new Date(dob) : undefined,
      address: {
        line1: addressLine1 || "",
        line2: addressLine2 || "",
        line3: addressLine3 || "",
      },
      country: country || "",
      provinceState: provinceState || "",
      district: district || "",
      city: city || "",
    });

    await Login.create({
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      role: "USER",
    });

    await sendOtpEmail(user.email, otp);

    res.status(201).json({
      message:
        "User profile created successfully. OTP sent to email for verification.",
      user: buildSafeUserResponse(user),
    });
  } catch (err) {
    if (err?.statusCode === 400 && err?.fieldErrors) {
      res.status(400).json({ message: err.message, fieldErrors: err.fieldErrors });
      return;
    }
    next(err);
  }
};

/**
 * VIEW own profile
 * Private route
 */
export const viewMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    res.json({
      user: buildSafeUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * EDIT profile details + optional PASSWORD CHANGE
 * Private route
 */
export const editMyProfile = async (req, res, next) => {
  try {
    const body = validate(editMyProfileSchema, req.body);

    const {
      firstName,
      lastName,
      countryCode,
      phone,
      gender,
      dob,
      addressLine1,
      addressLine2,
      addressLine3,
      country,
      provinceState,
      district,
      city,
      email,
      role,
      currentPassword,
      newPassword,
    } = body;

    const needPassword = Boolean(currentPassword || newPassword);

    const user = needPassword
      ? await User.findById(req.user._id).select("+password")
      : await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    if (email && email !== user.email) {
      res.status(400);
      throw new Error("Email cannot be changed.");
    }

    if (role) {
      res.status(400);
      throw new Error("Role cannot be changed.");
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (countryCode) user.countryCode = countryCode.trim();
    if (phone) user.phone = phone.trim();
    if (gender) user.gender = gender;

    if (dob !== undefined) {
      user.dob = dob ? new Date(dob) : undefined;
    }

    if (addressLine1 !== undefined) user.address.line1 = addressLine1 || "";
    if (addressLine2 !== undefined) user.address.line2 = addressLine2 || "";
    if (addressLine3 !== undefined) user.address.line3 = addressLine3 || "";
    if (country !== undefined) user.country = country || "";
    if (provinceState !== undefined) user.provinceState = provinceState || "";
    if (district !== undefined) user.district = district || "";
    if (city !== undefined) user.city = city || "";

    if (req.file) {
      if (user.profilePhotoPublicId) {
        await cloudinary.uploader.destroy(user.profilePhotoPublicId);
      }

      const uploadedPhoto = await uploadBufferToCloudinary(req.file.buffer);
      user.profilePhotoUrl = uploadedPhoto.secure_url;
      user.profilePhotoPublicId = uploadedPhoto.public_id;
    }

    if (needPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(401);
        throw new Error("Current password is incorrect.");
      }

      user.password = newPassword;
    }

    await user.save();

    const updateLoginData = {
      firstName: user.firstName,
      lastName: user.lastName,
    };

    if (needPassword) {
      updateLoginData.password = user.password;
    }

    await Login.updateOne({ userId: user._id }, { $set: updateLoginData });

    const safeUser = await User.findById(req.user._id);

    res.json({
      message: "Profile updated successfully.",
      user: buildSafeUserResponse(safeUser),
    });
  } catch (err) {
    if (err?.statusCode === 400 && err?.fieldErrors) {
      res.status(400).json({ message: err.message, fieldErrors: err.fieldErrors });
      return;
    }
    next(err);
  }
};

/**
 * DELETE own profile
 */
export const deleteMyProfile = async (req, res, next) => {
  try {
    const body = validate(deleteMyProfileSchema, req.body);
    const { password } = body;

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

    if (user.profilePhotoPublicId) {
      await cloudinary.uploader.destroy(user.profilePhotoPublicId);
    }

    await Login.deleteOne({ userId: user._id });
    await user.deleteOne();

    res.json({ message: "Profile deleted successfully." });
  } catch (err) {
    if (err?.statusCode === 400 && err?.fieldErrors) {
      res.status(400).json({ message: err.message, fieldErrors: err.fieldErrors });
      return;
    }
    next(err);
  }
};

/**
 * GET all users (ADMIN only)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      res.status(403);
      throw new Error("Access denied. Admin only.");
    }

    const userLogins = await Login.find({ role: "USER" }).select("userId");
    const userIds = userLogins.map((login) => login.userId);

    const users = await User.find({ _id: { $in: userIds } }).select(
      "-password -emailOtpHash -refreshTokenHash"
    );

    res.json({
      total: users.length,
      users,
    });
  } catch (err) {
    next(err);
  }
};