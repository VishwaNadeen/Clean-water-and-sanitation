import express from "express";
import { upload } from "../config/cloudinary.js";
import {
    createIssue,
    getAllIssues,
    getIssueById,
    assignIssue,
    resolveIssue,
    updateIssueStatus,
    deleteIssue
} from "../controllers/issueController.js";

const router = express.Router();

// Create new issue with image upload (up to 5 files)
router.post("/", upload.array('images', 5), createIssue);

// Get all issues with filtering and pagination
router.get("/", getAllIssues);

// Get single issue by ID  
router.get("/:id", getIssueById);

// Assign issue to staff member
router.patch("/:id/assign", assignIssue);

// Resolve issue with resolution images (up to 3 files)
router.patch("/:id/resolve", upload.array('resolutionImages', 3), resolveIssue);

// Update issue status
router.patch("/:id/status", updateIssueStatus);

// Delete issue
router.delete("/:id", deleteIssue);

export default router;