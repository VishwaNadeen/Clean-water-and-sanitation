import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js";

import staffRouts from "./routes/StaffManage/StaffRoute.js";
import managerWorkScheduleRoutes from "./routes/StaffManage/WorkScheduleManagerRoute.js";
import staffWorkScheduleRoutes from "./routes/StaffManage/WorkScheduleStaffRoute.js";


const app = express();
const PORT = process.env.PORT || 5001;

dotenv.config();

connectDb();

app.use(express.json());

//routes
app.use("/api/staff",staffRouts);
app.use("/api/manager/work-schedules", managerWorkScheduleRoutes);
app.use("/api/staff/work-schedules", staffWorkScheduleRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});