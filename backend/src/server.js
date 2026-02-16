import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js";

import exampleRoutes from "./routes/exampleRoute.js";

const app = express();
const PORT = 5001;

dotenv.config();

connectDb();

app.use(express.json());

//routes
app.use("/api/example", exampleRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});