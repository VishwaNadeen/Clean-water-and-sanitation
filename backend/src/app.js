import express from "express";
import exampleRoutes from "./routes/exampleRoute.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// Body Parser
app.use(express.json());

// Routes
app.use("/api/example", exampleRoutes);

// Custom Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;