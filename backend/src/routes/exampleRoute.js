import express from "express";
import { getAllExample, createExample, updateExample, deleteExample } from "../controllers/exampleController.js";

const router = express.Router();

router.get("/", getAllExample);
router.post("/", createExample);
router.put("/:id", updateExample);
router.delete("/:id", deleteExample);

export default router;