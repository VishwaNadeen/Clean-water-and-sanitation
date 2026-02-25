import Issue from "../models/issueModel.js";
import IssueCategory from "../models/issueCategoryModel.js";
import Province from "../models/provinceModel.js";
import District from "../models/districtModel.js";
import City from "../models/cityModel.js";
import User from "../models/userModel.js";          // Placeholder - will be replaced by team member
import Restroom from "../models/restroomModel.js";  // Placeholder - will be replaced by team member
import { uploadToCloudinary } from "../../config/cloudinary.js";
import mongoose from "mongoose";

// CREATE ISSUE
export const createIssue = async (req, res) => {
    try {
        const {
            title,
            description,
            categoryId,
            subCategoryId,
            provinceId,
            districtId,
            cityId,
            restroomId, 
            priority 
        } = req.body;
        const reportedBy = req.body.reportedBy || "699b293cabd88401534705a"; // Use a valid ObjectId

        // VALIDATION
        if (!title || title.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Title is required and cannot be empty"
            });
        }

        if (!description || description.trim().length < 5) {
            return res.status(400).json({
                success: false,
                message: "Description is required and must be at least 5 characters"
            });
        }

        // Validate Category and Subcategory
        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Category is required"
            });
        }

        const category = await IssueCategory.findById(categoryId);
        if (!category || !category.isActive) {
            return res.status(400).json({
                success: false,
                message: "Invalid or inactive category"
            });
        }

        if (!subCategoryId) {
            return res.status(400).json({
                success: false,
                message: "Subcategory ID is required"
            });
        }

        // Validate subcategory exists in the category
        const subCategory = category.subCategories.id(subCategoryId);
        if (!subCategory || !subCategory.isActive) {
            return res.status(400).json({
                success: false,
                message: "Invalid or inactive subcategory"
            });
        }

        // Validate Location
        if (!provinceId || !districtId || !cityId) {
            return res.status(400).json({
                success: false,
                message: "Province, District, and City are required"
            });
        }

        const [province, district, city] = await Promise.all([
            Province.findById(provinceId),
            District.findById(districtId),
            City.findById(cityId)
        ]);

        if (!province || !district || !city) {
            return res.status(400).json({
                success: false,
                message: "Invalid location information"
            });
        }

        if (!restroomId || restroomId.length !== 24) {
            return res.status(400).json({
                success: false,
                message: "Valid restroom ID is required (24 characters)"
            });
        }

        if (priority && !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
            return res.status(400).json({
                success: false,
                message: "Priority must be: LOW, MEDIUM, HIGH, or URGENT"
            });
        }

        let images = [];
        // Handle image uploads
        if (req.files && req.files.length > 0) {
            try {
                for (const file of req.files) {
                    // Validate file type
                    if (!file.mimetype.startsWith('image/')) {
                        return res.status(400).json({
                            success: false,
                            message: "Only image files are allowed"
                        });
                    }

                    // Validate file size (5MB limit)
                    if (file.size > 5 * 1024 * 1024) {
                        return res.status(400).json({
                            success: false,
                            message: "Image size must be less than 5MB"
                        });
                    }

                    const uploadResult = await uploadToCloudinary(file.buffer, file.originalname);
                    images.push({
                        url: uploadResult.url,
                        publicId: uploadResult.publicId
                    });
                }
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading images. Please try again."
                });
            }
        }

        const newIssue = new Issue({
            title: title.trim(),
            description: description.trim(),
            categoryId,
            subCategoryId,
            provinceId,
            districtId,
            cityId,
            restroomId,
            priority: priority || 'MEDIUM',
            reportedBy,
            images
        });

        const savedIssue = await newIssue.save();
        
        // Structure response with proper field ordering
        const issueObj = savedIssue.toObject();
        const responseData = {
            _id: issueObj._id,
            issueNumber: issueObj.issueNumber,
            categoryId: issueObj.categoryId,
            subCategoryId: issueObj.subCategoryId,
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
        
        res.status(201).json({
            success: true,
            message: "Issue created successfully!",
            data: responseData
        });

    } catch (error) {
        console.error('Create issue error:', error);
        res.status(500).json({
            success: false,
            message: "Error creating issue",
            error: error.message
        });
    }
};

// GET ALL ISSUES
export const getAllIssues = async (req, res) => {
    try {
        const { status, page = 1, limit = 10, issueNumber } = req.query;
        
        // VALIDATION  
        if (page && (isNaN(page) || page < 1)) {
            return res.status(400).json({
                success: false,
                message: "Page must be a positive number"
            });
        }

        if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
            return res.status(400).json({
                success: false,
                message: "Limit must be between 1 and 100"
            });
        }

        const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status filter. Valid statuses: " + validStatuses.join(', ')
            });
        }

        const filter = {};
        if (status) filter.status = status;
        if (issueNumber) filter.issueNumber = { $regex: issueNumber, $options: 'i' };

        const skip = (page - 1) * limit;
        const issues = await Issue.find(filter)
            .populate('categoryId', 'name subCategories')
            .populate('provinceId', 'name')
            .populate('districtId', 'name')
            .populate('cityId', 'name')
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Issue.countDocuments(filter);

        // Filter issues to show only selected subcategory
        const issuesWithSubcategoryNames = issues.map(issue => {
            const issueObj = issue.toObject();
            
            // Get the selected subcategory name
            let subCategoryName = 'Unknown Subcategory';
            if (issue.categoryId && issue.categoryId.subCategories) {
                const subCategory = issue.categoryId.subCategories.id(issue.subCategoryId);
                subCategoryName = subCategory ? subCategory.name : 'Unknown Subcategory';
            }
            
            // Restructure response with proper field ordering
            return {
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
        });

        res.status(200).json({
            success: true,
            data: issuesWithSubcategoryNames,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get all issues error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching issues",
            error: error.message
        });
    }
};

// GET ISSUE BY ID
export const getIssueById = async (req, res) => {
    try {
        const { id } = req.params;

        // VALIDATION
        if (!id || id.length !== 24) {
            return res.status(400).json({
                success: false,
                message: "Valid issue ID is required (24 characters)"
            });
        }

        const issue = await Issue.findById(id)
            .populate('categoryId', 'name subCategories')
            .populate('provinceId', 'name')
            .populate('districtId', 'name') 
            .populate('cityId', 'name')
            .populate('reportedBy', 'name email');

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        // Add subcategory name and clean response
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

        res.status(200).json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('Get issue by ID error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching issue",
            error: error.message
        });
    }
};

// RESOLVE ISSUE
export const resolveIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const { resolutionNote } = req.body;
        
        // VALIDATION
        if (!id || id.length !== 24) {
            return res.status(400).json({
                success: false,
                message: "Valid issue ID is required (24 characters)"
            });
        }

        if (!resolutionNote || resolutionNote.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: "Resolution note is required and must be at least 10 characters"
            });
        }
        
        let resolutionImages = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadResult = await uploadToCloudinary(file.buffer, file.originalname);
                resolutionImages.push({
                    url: uploadResult.url,
                    publicId: uploadResult.publicId
                });
            }
        }

        const issue = await Issue.findByIdAndUpdate(
            id,
            { 
                status: 'RESOLVED',
                resolvedAt: new Date(),
                resolutionNote: resolutionNote.trim(),
                resolutionImages
            },
            { new: true }
        );

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Issue resolved successfully!",
            data: issue
        });

    } catch (error) {
        console.error('Resolve issue error:', error);
        res.status(500).json({
            success: false,
            message: "Error resolving issue",
            error: error.message
        });
    }
};

// UPDATE ISSUE STATUS
export const updateIssueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // VALIDATION
        if (!id || id.length !== 24) {
            return res.status(400).json({
                success: false,
                message: "Valid issue ID is required (24 characters)"
            });
        }

        const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Valid status is required. Valid statuses: " + validStatuses.join(', ')
            });
        }
        
        const issue = await Issue.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Status updated successfully!",
            data: issue
        });

    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            message: "Error updating status",
            error: error.message
        });
    }
};

// DELETE ISSUE
export const deleteIssue = async (req, res) => {
    try {
        const { id } = req.params;

        // VALIDATION
        if (!id || id.length !== 24) {
            return res.status(400).json({
                success: false,
                message: "Valid issue ID is required (24 characters)"
            });
        }

        const deletedIssue = await Issue.findByIdAndDelete(id);
        
        if (!deletedIssue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Issue deleted successfully!"
        });

    } catch (error) {
        console.error('Delete issue error:', error);
        res.status(500).json({
            success: false,
            message: "Error deleting issue",
            error: error.message
        });
    }
};

// GET USER'S OWN ISSUES
export const getUserIssues = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;
        
        // VALIDATION
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format"
            });
        }
        
        if (page && (isNaN(page) || page < 1)) {
            return res.status(400).json({
                success: false,
                message: "Page must be a positive number"
            });
        }

        if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
            return res.status(400).json({
                success: false,
                message: "Limit must be between 1 and 100"
            });
        }

        const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status filter. Valid statuses: " + validStatuses.join(', ')
            });
        }

        // Build filter for user's issues
        const filter = {
            reportedBy: new mongoose.Types.ObjectId(userId)
        };
        
        if (status) filter.status = status;

        const skip = (page - 1) * limit;
        const userIssues = await Issue.find(filter)
            .populate('categoryId', 'name subCategories')
            .populate('provinceId', 'name')
            .populate('districtId', 'name')
            .populate('cityId', 'name')
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Issue.countDocuments(filter);

        // Filter issues to show only selected subcategory
        const issuesWithSubcategoryNames = userIssues.map(issue => {
            const issueObj = issue.toObject();
            
            // Find and add the subcategory name
            if (issueObj.categoryId && issueObj.categoryId.subCategories) {
                const subcategory = issueObj.categoryId.subCategories.find(
                    sub => sub._id.toString() === issueObj.subCategoryId.toString()
                );
                issueObj.subCategoryName = subcategory ? subcategory.name : 'Unknown Subcategory';
            }
            
            return issueObj;
        });

        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json({
            success: true,
            message: "User issues retrieved successfully",
            data: {
                issues: issuesWithSubcategoryNames,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalIssues: total,
                    limit: parseInt(limit),
                    hasNextPage,
                    hasPrevPage
                }
            }
        });

    } catch (error) {
        console.error('Get user issues error:', error);
        res.status(500).json({
            success: false,
            message: "Error retrieving user issues",
            error: error.message
        });
    }
};