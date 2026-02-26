import dotenv from "dotenv";
import app from "./app.js";
import { connectDb } from "./config/db.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5001;

// Connect to database
connectDb();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});