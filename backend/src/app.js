import express from "express";
import cors from "cors";

import issueRoutes from "./issue-reporting/routes/issueRoutes.js";
import issueCategoryRoutes from "./issue-reporting/routes/issueCategoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/issues", issueRoutes);
app.use("/api/categories", issueCategoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Clean Water & Sanitation API is running!"
  });
});

// Custom error handling middlewares from team member
app.use(notFound);
app.use(errorHandler);

export default app;