import Issue from "../models/issueModel.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

// CREATE ISSUE
export const createIssue = async (req, res) => {
    try {
        const { title, description, issueType, restroomId, priority } = req.body;
        const reportedBy = req.body.reportedBy || "60d5ecb54b24d630f4b0c123";

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

        const validIssueTypes = ['WATER', 'CLEANLINESS', 'PLUMBING', 'LIGHTING', 'SUPPLIES', 'MAINTENANCE', 'OTHER'];
        if (!issueType || !validIssueTypes.includes(issueType)) {
            return res.status(400).json({
                success: false,
                message: "Valid issue type is required. Valid types: " + validIssueTypes.join(', ')
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
            issueType,
            restroomId,
            priority: priority || 'MEDIUM',
            reportedBy,
            images
        });

        const savedIssue = await newIssue.save();
        res.status(201).json({
            success: true,
            message: "Issue created successfully!",
            data: savedIssue
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
        const { status, page = 1, limit = 10 } = req.query;
        
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

        const skip = (page - 1) * limit;
        const issues = await Issue.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Issue.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: issues,
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

        const issue = await Issue.findById(id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        res.status(200).json({
            success: true,
            data: issue
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

// ASSIGN ISSUE TO STAFF
export const assignIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedTo } = req.body;
        
        // VALIDATION
        if (!id || id.length !== 24) {
            return res.status(400).json({
                success: false,
                message: "Valid issue ID is required (24 characters)"
            });
        }

        if (!assignedTo || assignedTo.length !== 24) {
            return res.status(400).json({
                success: false,
                message: "Valid staff ID is required for assignment (24 characters)"
            });
        }
        
        const issue = await Issue.findByIdAndUpdate(
            id,
            { 
                assignedTo,
                status: 'IN_PROGRESS'
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
            message: "Issue assigned successfully!",
            data: issue
        });

    } catch (error) {
        console.error('Assign issue error:', error);
        res.status(500).json({
            success: false,
            message: "Error assigning issue",
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