import express from "express";
import exampleRoutes from "./routes/exampleRoute.js";

const app = express();
const PORT = 5001;

app.use(express.json());

//routes
app.use("/api/example", exampleRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});