// backend/routes/staffRoutes.js
import express from "express";
import {
  createStaff,
  listStaff,
  getStaffById,
  getAllStaff,
  updateStaff,
  deleteStaff,

} from "../../controllers/Staff-Management/StaffCtrl.js";

//import { requireAuth } from "../middlewares/auth.js"; // your existing auth middleware

const router = express.Router();

// All staff routes require authentication (same style as your appointment routes)
//router.use(requireAuth);

// Create staff
router.post("/", createStaff);

// List staff (filters supported)
router.get("/", listStaff);

// Get one staff
router.get("/:id", getStaffById);


// Update staff
router.put("/:id", updateStaff);
router.patch("/:id", updateStaff);

// Delete staff
router.delete("/:id", deleteStaff);

export default router;