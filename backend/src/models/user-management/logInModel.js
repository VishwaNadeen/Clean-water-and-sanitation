import mongoose from "mongoose";

const loginSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["USER", "STAFF", "ADMIN"],
      default: "USER",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

//  Prevent OverwriteModelError (important for nodemon / hot reload)
const Login = mongoose.models.Login || mongoose.model("Login", loginSchema);

export default Login;