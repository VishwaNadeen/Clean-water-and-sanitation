import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js";

import exampleRoutes from "./routes/exampleRoute.js";
import staffRoutes from "./routes/StaffRoute.js";
import workScheduleRoute from "./routes/StaffWorkScheduleRoute.js";

const app = express();
const PORT = process.env.PORT || 5001;

dotenv.config();

connectDb();

app.use(express.json());

//routes
app.use("/api/example", exampleRoutes);
app.use("/api/staff",staffRoutes);
app.use("/api/work-schedules", workScheduleRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});