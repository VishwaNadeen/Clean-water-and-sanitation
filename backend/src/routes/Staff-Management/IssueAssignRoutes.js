import express from "express";
import { assignIssueToStaff } from "../../controllers/Staff-Management/IssueAssignCtrl.js";

const router = express.Router();

router.post("/:issueId", assignIssueToStaff);

export default router;