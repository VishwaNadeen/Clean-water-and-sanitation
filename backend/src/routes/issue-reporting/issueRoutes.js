import express from "express";
import { upload } from "../../utils/issue-reporting/cloudinary.js";
import Issue from "../../models/issue-reporting/issueModel.js";
import { protect, checkAccountStatus, authorizeRoles } from "../../middleware/authMiddleware.js";
import {
    createIssue,
    getAllIssues,
    getIssueById,
    updateIssue,
    cancelIssue,
    resolveIssue,
    updateIssueStatus,
    deleteIssue,
    getUserIssues
} from "../../controllers/issue-reporting/issueController.js";

const router = express.Router();

// Create new issue with image upload (up to 5 files) - Requires authentication
router.post("/", protect, checkAccountStatus, upload.array('images', 5), createIssue);

// Get issues (user's own issues) - Requires authentication  
router.get("/", protect, checkAccountStatus, getAllIssues);

// Get user's own issues - Must come BEFORE /:id route
router.get("/user", protect, checkAccountStatus, getUserIssues);

// Get all issues for admin - Must come BEFORE /:id route
router.get("/admin", protect, checkAccountStatus, authorizeRoles("ADMIN"), getAllIssues);

// Search issue by issue number
router.get("/search/:issueNumber", async (req, res) => {
    try {
        const { issueNumber } = req.params;
        
        if (!issueNumber || issueNumber.length !== 8) {
            return res.status(400).json({
                success: false,
                message: "Valid 8-digit issue number is required"
            });
        }
        
        const issue = await Issue.findOne({ issueNumber })
            .populate('categoryId', 'name subCategories')
            .populate('provinceId', 'name')
            .populate('districtId', 'name')
            .populate('cityId', 'name')
            .populate('reportedBy', 'firstName lastName email');
            
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found with this number"
            });
        }
        
        // Add subcategory name and clean response (same logic as getIssueById)
        let subCategoryName = 'Unknown Subcategory';
        if (issue.categoryId && issue.categoryId.subCategories) {
            const subCategory = issue.categoryId.subCategories.id(issue.subCategoryId);
            subCategoryName = subCategory ? subCategory.name : 'Unknown Subcategory';
        }
        
        const issueObj = issue.toObject();
        
        // Structure response with proper field ordering
        const responseData = {
            _id: issueObj._id,
            issueNumber: issueObj.issueNumber,
            categoryId: {
                _id: issue.categoryId._id,
                name: issue.categoryId.name
            },
            subCategoryId: issueObj.subCategoryId,
            subCategoryName: subCategoryName,
            provinceId: issueObj.provinceId,
            districtId: issueObj.districtId,
            cityId: issueObj.cityId,
            title: issueObj.title,
            description: issueObj.description,
            restroomId: issueObj.restroomId,
            status: issueObj.status,
            priority: issueObj.priority,
            reportedBy: issueObj.reportedBy,
            images: issueObj.images,
            resolvedAt: issueObj.resolvedAt,
            resolutionNote: issueObj.resolutionNote,
            resolutionImages: issueObj.resolutionImages,
            adminNotes: issueObj.adminNotes,
            createdAt: issueObj.createdAt,
            updatedAt: issueObj.updatedAt,
            __v: issueObj.__v
        };
        
        res.json({
            success: true,
            data: responseData
        });
        
    } catch (error) {
        console.error('Search issue error:', error);
        res.status(500).json({
            success: false,
            message: "Error searching issue",
            error: error.message
        });
    }
});

// Get single issue by ID
router.get("/:id", protect, checkAccountStatus, getIssueById);

// Update issue (title, description, priority, etc.) - User can update own issues, Admin can update any
router.put("/:id", protect, checkAccountStatus, updateIssue);

// Cancel own issue while still OPEN
router.patch("/:id/cancel", protect, checkAccountStatus, cancelIssue);

// Resolve issue with resolution images (up to 3 files) - Admin only
router.patch("/:id/resolve", protect, checkAccountStatus, authorizeRoles("ADMIN"), upload.array('resolutionImages', 3), resolveIssue);

// Update issue status - Admin only
router.patch("/:id/status", protect, checkAccountStatus, authorizeRoles("ADMIN"), updateIssueStatus);

// Delete issue - Admin only
router.delete("/:id", protect, checkAccountStatus, authorizeRoles("ADMIN"), deleteIssue);

export default router;
