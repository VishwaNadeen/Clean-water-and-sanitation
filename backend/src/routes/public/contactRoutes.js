import express from "express";
import { submitContactMessage } from "../../controllers/public/contactController.js";

const router = express.Router();

router.post("/", submitContactMessage);

export default router;
