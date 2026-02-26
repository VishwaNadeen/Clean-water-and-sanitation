import express from "express";
import cors from "cors";

import userRoutes from "./routes/user-management/userRoutes.js";
import authRoutes from "./routes/user-management/authRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import staffRouts from "./routes/Staff-Management/StaffRoute.js";
import managerWorkScheduleRoutes from "./routes/Staff-Management/WorkScheduleManagerRoute.js";
import staffWorkScheduleRoutes from "./routes/Staff-Management/WorkScheduleStaffRoute.js";

import restroomRoutes from "./routes/restRoom-Management/restroomRoutes.js";

import issueRoutes from "./routes/issue-reporting/issueRoutes.js";
import issueCategoryRoutes from "./routes/issue-reporting/issueCategoryRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/staff",staffRouts);
app.use("/api/manager/work-schedules", managerWorkScheduleRoutes);
app.use("/api/staff/work-schedules", staffWorkScheduleRoutes);

app.use("/api/restrooms", restroomRoutes);

app.use("/api/issues", issueRoutes);
app.use("/api/categories", issueCategoryRoutes);

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Clean Water & Sanitation API is running!"
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
})

// Custom error handling middlewares from team member
app.use(notFound);
app.use(errorHandler);

export default app;