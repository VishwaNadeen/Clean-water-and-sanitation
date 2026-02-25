import express from "express";
import dotenv from "dotenv";
//import cors from "cors";
import { connectDb } from "./config/db.js";

//import { devAdmin } from "./middleware/devAdmin.js";
//import exampleRoutes from "./routes/exampleRoute.js";
import restroomRoutes from "./routes/restRoom-Management/restroomRoutes.js";

dotenv.config();
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

const app = express();

// middleware
//app.use(cors());
app.use(express.json());

// DB
connectDb();

// routes
//app.use("/api/example", exampleRoutes);       
app.use("/api/restrooms", restroomRoutes);    

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error", error: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});