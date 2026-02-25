import express from "express";
import cors from "cors";

import issueRoutes from "./issue-reporting/routes/issueRoutes.js";
import issueCategoryRoutes from "./issue-reporting/routes/issueCategoryRoutes.js";

const app = express();

// Middleware
app.use(cors());
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/issues", issueRoutes);
app.use("/api/categories", issueCategoryRoutes);

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Clean Water & Sanitation API is running!"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server Error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

export default app;
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Custom Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
