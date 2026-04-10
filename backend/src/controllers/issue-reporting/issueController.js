import Issue from "../../models/issue-reporting/issueModel.js";
import IssueCategory from "../../models/issue-reporting/issueCategoryModel.js";
import Province from "../../models/issue-reporting/provinceModel.js";
import District from "../../models/issue-reporting/districtModel.js";
import City from "../../models/issue-reporting/cityModel.js";
import WorkSchedule from "../../models/Staff-Management/WorkScheduleModel.js";
import { uploadToCloudinary } from "../../utils/issue-reporting/cloudinary.js";
import mongoose from "mongoose";

const OPEN_WORK_STATUSES = ["Assigned", "Pending"];
const IN_PROGRESS_WORK_STATUSES = ["InProgress"];
const RESOLVED_WORK_STATUSES = ["Completed", "Verified"];

const extractWorkResolutionNote = (schedule) => {
    const parts = [
        schedule?.staffNote,
        schedule?.issuesFound,
        schedule?.materialsUsed
    ]
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean);

    return parts.join(" | ");
};

const syncIssuesFromWorkSchedules = async (issues) => {
    const issueList = Array.isArray(issues) ? issues : [issues].filter(Boolean);
    if (!issueList.length) {
        return;
    }

    const issueIds = issueList
        .map((issue) => issue?._id)
        .filter(Boolean)
        .map((id) => id.toString());

    if (!issueIds.length) {
        return;
    }

    const schedules = await WorkSchedule.find({
        issueId: { $in: issueIds },
        status: {
            $in: [...OPEN_WORK_STATUSES, ...IN_PROGRESS_WORK_STATUSES, ...RESOLVED_WORK_STATUSES]
        }
    })
        .select("issueId status completedAt verifiedAt staffNote issuesFound materialsUsed")
        .sort({ verifiedAt: -1, completedAt: -1, updatedAt: -1 })
        .lean();

    if (!schedules.length) {
        return;
    }

    const latestScheduleByIssue = new Map();
    for (const schedule of schedules) {
        const key = schedule.issueId?.toString();
        if (!key || latestScheduleByIssue.has(key)) {
            continue;
        }
        latestScheduleByIssue.set(key, schedule);
    }

    const bulkUpdates = [];

    for (const issue of issueList) {
        const issueId = issue?._id?.toString();
        const schedule = issueId ? latestScheduleByIssue.get(issueId) : null;
        if (!schedule) {
            continue;
        }

        if (OPEN_WORK_STATUSES.includes(schedule.status)) {
            if (issue.status !== "OPEN" || issue.resolvedAt || issue.resolutionNote) {
                bulkUpdates.push({
                    updateOne: {
                        filter: { _id: issue._id },
                        update: {
                            $set: {
                                status: "OPEN",
                                resolvedAt: null,
                                resolutionNote: ""
                            }
                        }
                    }
                });
            }

            issue.status = "OPEN";
            issue.resolvedAt = null;
            issue.resolutionNote = "";
            continue;
        }

        if (IN_PROGRESS_WORK_STATUSES.includes(schedule.status)) {
            if (issue.status !== "IN_PROGRESS") {
                bulkUpdates.push({
                    updateOne: {
                        filter: { _id: issue._id },
                        update: {
                            $set: {
                                status: "IN_PROGRESS"
                            }
                        }
                    }
                });
            }

            issue.status = "IN_PROGRESS";
            continue;
        }

        const resolvedAt = schedule.verifiedAt || schedule.completedAt || issue.resolvedAt || new Date();
        const resolutionNote = extractWorkResolutionNote(schedule);

        if (issue.status !== "RESOLVED" || !issue.resolvedAt || (!issue.resolutionNote && resolutionNote)) {
            bulkUpdates.push({
                updateOne: {
                    filter: { _id: issue._id },
                    update: {
                        $set: {
                            status: "RESOLVED",
                            resolvedAt,
                            ...(resolutionNote ? { resolutionNote } : {})
                        }
                    }
                }
            });
        }

        issue.status = "RESOLVED";
        issue.resolvedAt = resolvedAt;
        if (resolutionNote && !issue.resolutionNote) {
            issue.resolutionNote = resolutionNote;
        }
    }

    if (bulkUpdates.length) {
        await Issue.bulkWrite(bulkUpdates);
    }
};

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
        
        // Get authenticated user ID from middleware
        const reportedBy = req.user._id;

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

        // Check if categoryId is a valid ObjectId format
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID format. Please provide a valid category ID."
            });
        }

        const category = await IssueCategory.findById(categoryId);
        if (!category || !category.isActive) {
            return res.status(400).json({
                success: false,
                message: "Category not found in the system or is inactive. Please select a valid category."
            });
        }

        if (!subCategoryId) {
            return res.status(400).json({
                success: false,
                message: "Subcategory ID is required"
            });
        }

        // Check if subCategoryId is a valid ObjectId format
        if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subcategory ID format. Please provide a valid subcategory ID."
            });
        }

        // Validate subcategory exists in the category
        const subCategory = category.subCategories.id(subCategoryId);
        if (!subCategory || !subCategory.isActive) {
            return res.status(400).json({
                success: false,
                message: "Subcategory not found in the selected category or is inactive. Please select a valid subcategory."
            });
        }

        // Validate Location
        if (!provinceId || !districtId || !cityId) {
            return res.status(400).json({
                success: false,
                message: "Province, District, and City are required"
            });
        }

        // Validate ObjectId formats for location fields
        if (!mongoose.Types.ObjectId.isValid(provinceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid province ID format. Please provide a valid province ID."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(districtId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid district ID format. Please provide a valid district ID."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(cityId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid city ID format. Please provide a valid city ID."
            });
        }

        const [province, district, city] = await Promise.all([
            Province.findById(provinceId),
            District.findById(districtId),
            City.findById(cityId)
        ]);

        if (!province) {
            return res.status(404).json({
                success: false,
                message: "Province not found in the system. Please select a valid province."
            });
        }

        if (!district) {
            return res.status(404).json({
                success: false,
                message: "District not found in the system. Please select a valid district."
            });
        }

        if (!city) {
            return res.status(404).json({
                success: false,
                message: "City not found in the system. Please select a valid city."
            });
        }

        // Validate Restroom ID
        if (!restroomId) {
            return res.status(400).json({
                success: false,
                message: "Restroom ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(restroomId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid restroom ID format. Please provide a valid restroom ID."
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
                console.error('Error details:', {
                    message: uploadError.message,
                    stack: uploadError.stack,
                    cloudinaryConfig: {
                        cloud_name: process.env.CLOUDINARY_NAME ? 'SET' : 'NOT SET',
                        api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET', 
                        api_secret: process.env.CLOUDINARY_SECRET_KEY ? 'SET' : 'NOT SET'
                    }
                });
                return res.status(500).json({
                    success: false,
                    message: `Error uploading images: ${uploadError.message}. Please check your image format and size.`
                });
            }
        }

        // Validate User ID (reportedBy) - User is authenticated via middleware
        if (!reportedBy || !mongoose.Types.ObjectId.isValid(reportedBy)) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in to report an issue."
            });
        }

        // User existence is already verified by auth middleware
        // req.user contains the authenticated user data

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

// GET ALL ISSUES (Role-based access: USER sees own issues, ADMIN sees all issues)
export const getAllIssues = async (req, res) => {
    try {
        // Get authenticated user ID and role from middleware
        const userId = req.user._id;
        const userRole = req.user.role;
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

        // Role-based filtering
        const filter = {};
        
        // If user is not ADMIN, only show their own issues
        if (userRole !== 'ADMIN') {
            filter.reportedBy = new mongoose.Types.ObjectId(userId);
        }
        // If userRole is ADMIN, no reportedBy filter - show all issues
        
        if (status) filter.status = status;
        if (issueNumber) filter.issueNumber = { $regex: issueNumber, $options: 'i' };

        const skip = (page - 1) * limit;
        const issues = await Issue.find(filter)
            .populate('categoryId', 'name subCategories')
            .populate('provinceId', 'name')
            .populate('districtId', 'name')
            .populate('cityId', 'name')
            .populate('restroomId', 'name city district province condition avgRating ratingCount location')
            .populate('reportedBy', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        await syncIssuesFromWorkSchedules(issues);

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
            message: userRole === 'ADMIN' ? "All issues retrieved successfully" : "Your issues retrieved successfully",
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
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Issue ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid issue ID format. Please provide a valid issue ID."
            });
        }

        const issue = await Issue.findById(id)
            .populate('categoryId', 'name subCategories')
            .populate('provinceId', 'name')
            .populate('districtId', 'name') 
            .populate('cityId', 'name')
            .populate('restroomId', 'name city district province condition avgRating ratingCount location')
            .populate('reportedBy', 'firstName lastName email');

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        if (req.user.role !== 'ADMIN' && issue.reportedBy?._id?.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only view your own issues."
            });
        }

        await syncIssuesFromWorkSchedules(issue);

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
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Issue ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid issue ID format. Please provide a valid issue ID."
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
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Issue ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid issue ID format. Please provide a valid issue ID."
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

// UPDATE ISSUE (General updates - title, description, priority, etc.)
export const updateIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priority, categoryId, subCategoryId, provinceId, districtId, cityId, restroomId } = req.body;
        
        // VALIDATION
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Issue ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid issue ID format. Please provide a valid issue ID."
            });
        }

        // Find the issue first to check ownership (users can only update their own issues, admins can update any)
        const existingIssue = await Issue.findById(id);
        if (!existingIssue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        // Check if user can update this issue (own issue or admin)
        if (req.user.role !== 'ADMIN' && existingIssue.reportedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only update your own issues."
            });
        }

        if (req.user.role !== 'ADMIN' && existingIssue.status !== 'OPEN') {
            return res.status(400).json({
                success: false,
                message: "You can only update issues while the status is OPEN."
            });
        }

        // Build update object with only provided fields
        const updateData = {};
        if (title !== undefined) {
            if (!title || title.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Title cannot be empty"
                });
            }
            updateData.title = title.trim();
        }
        
        if (description !== undefined) {
            if (!description || description.trim().length < 5) {
                return res.status(400).json({
                    success: false,
                    message: "Description must be at least 5 characters"
                });
            }
            updateData.description = description.trim();
        }

        if (priority !== undefined) {
            const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
            if (!validPriorities.includes(priority)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid priority is required. Valid priorities: " + validPriorities.join(', ')
                });
            }
            updateData.priority = priority;
        }

        // Validate ObjectIds if provided
        const objectIdFields = { categoryId, subCategoryId, provinceId, districtId, cityId, restroomId };
        for (const [field, value] of Object.entries(objectIdFields)) {
            if (value !== undefined) {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid ${field} format. Please provide a valid ${field}.`
                    });
                }
                updateData[field] = value;
            }
        }

        // Update the issue
        const updatedIssue = await Issue.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('categoryId', 'name')
        .populate('provinceId', 'name')
        .populate('districtId', 'name')
        .populate('cityId', 'name')
        .populate('restroomId', 'name city district province condition avgRating ratingCount location')
        .populate('reportedBy', 'firstName lastName email');

        // Get subcategory name separately if needed
        let subCategoryName = 'Unknown Subcategory';
        if (updatedIssue.categoryId && updatedIssue.subCategoryId) {
            // Get the full category with subcategories to find the subcategory name
            const categoryWithSubs = await IssueCategory.findById(updatedIssue.categoryId._id).select('subCategories');
            if (categoryWithSubs && categoryWithSubs.subCategories) {
                const subCategory = categoryWithSubs.subCategories.find(
                    sub => sub._id.toString() === updatedIssue.subCategoryId.toString()
                );
                subCategoryName = subCategory ? subCategory.name : 'Unknown Subcategory';
            }
        }

        // Structure response with proper field ordering
        const issueObj = updatedIssue.toObject();
        const responseData = {
            _id: issueObj._id,
            issueNumber: issueObj.issueNumber,
            categoryId: {
                _id: issueObj.categoryId._id,
                name: issueObj.categoryId.name
            },
            subCategoryId: {
                _id: issueObj.subCategoryId,
                name: subCategoryName
            },
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
            message: "Issue updated successfully!",
            data: responseData
        });

    } catch (error) {
        console.error('Update issue error:', error);
        res.status(500).json({
            success: false,
            message: "Error updating issue",
            error: error.message
        });
    }
};

// DELETE ISSUE
export const deleteIssue = async (req, res) => {
    try {
        const { id } = req.params;

        // VALIDATION
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Issue ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid issue ID format. Please provide a valid issue ID."
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

// GET USER'S OWN ISSUES (Authenticated user's issues only)
export const getUserIssues = async (req, res) => {
    try {
        // Get authenticated user ID from middleware
        const userId = req.user._id;
        const { status, page = 1, limit = 10 } = req.query;
        
        // User is already authenticated and verified by middleware
        // No need to validate userId or check if user exists
        
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
            .populate('restroomId', 'name city district province condition avgRating ratingCount location')
            .populate('reportedBy', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        await syncIssuesFromWorkSchedules(userIssues);

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

// CANCEL ISSUE (User can cancel own OPEN issue, admin can cancel any)
export const cancelIssue = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Issue ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid issue ID format. Please provide a valid issue ID."
            });
        }

        const existingIssue = await Issue.findById(id);
        if (!existingIssue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        if (req.user.role !== 'ADMIN' && existingIssue.reportedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only cancel your own issues."
            });
        }

        if (req.user.role !== 'ADMIN' && existingIssue.status !== 'OPEN') {
            return res.status(400).json({
                success: false,
                message: "Only OPEN issues can be cancelled."
            });
        }

        if (existingIssue.status === 'CLOSED') {
            return res.status(400).json({
                success: false,
                message: "This issue is already closed."
            });
        }

        existingIssue.status = 'CLOSED';
        if (!existingIssue.adminNotes) {
            existingIssue.adminNotes = 'Issue cancelled by reporter.';
        }
        await existingIssue.save();

        return res.status(200).json({
            success: true,
            message: "Issue cancelled successfully."
        });
    } catch (error) {
        console.error('Cancel issue error:', error);
        res.status(500).json({
            success: false,
            message: "Error cancelling issue",
            error: error.message
        });
    }
};
