import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

// Connect DB
connectDb();

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});