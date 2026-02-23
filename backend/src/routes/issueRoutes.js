import express from "express";
import { upload } from "../config/cloudinary.js";
import Issue from "../models/issueModel.js";
import IssueCategory from "../models/issueCategoryModel.js";
import Province from "../models/provinceModel.js";
import District from "../models/districtModel.js";
import City from "../models/cityModel.js";
import {
    createIssue,
    getAllIssues,
    getIssueById,
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
            .populate('reportedBy', 'name email');
            
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

// Resolve issue with resolution images (up to 3 files)
router.patch("/:id/resolve", upload.array('resolutionImages', 3), resolveIssue);

// Update issue status
router.patch("/:id/status", updateIssueStatus);

// Delete issue
router.delete("/:id", deleteIssue);

export default router;