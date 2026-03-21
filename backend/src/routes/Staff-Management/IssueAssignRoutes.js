import express from "express";
import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";
import { assignIssueToStaff } from "../../controllers/Staff-Management/IssueAssignCtrl.js";

const router = express.Router();

// ✅ Admin only
router.post(
  "/:issueId/assign",
  protect,
  authorizeRoles("ADMIN"),
  assignIssueToStaff
);

export default router;