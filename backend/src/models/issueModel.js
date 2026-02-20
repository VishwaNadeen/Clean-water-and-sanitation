import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
    {
        // Category Information
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'IssueCategory',
            required: true
        },
        
        subCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        
        subCategoryName: {
            type: String,
            required: true,
            trim: true
        },

        // Location Information
        provinceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Province',
            required: true
        },
        
        districtId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District',
            required: true
        },
        
        cityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'City',
            required: true
        },

        // Issue Details
        title: {
            type: String,
            required: true,
            trim: true
        },
        
        description: {
            type: String,
            required: true
        },
        
        // Restroom Reference
        restroomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restroom',
            required: true
        },

        // Status Management
        status: {
            type: String,
            enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
            default: 'OPEN'
        },
        
        priority: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
            default: 'MEDIUM'
        },
        
        // User Management
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        
        // Image Upload
        images: [{
            url: {
                type: String,
                required: true
            },
            publicId: {
                type: String,
                required: true
            },
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],
        
        // Resolution Data
        resolvedAt: {
            type: Date,
            default: null
        },
        
        resolutionNote: {
            type: String,
            default: ''
        },
        
        resolutionImages: [{
            url: {
                type: String
            },
            publicId: {
                type: String
            },
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],
        
        // Admin Notes
        adminNotes: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

// Index for better query performance
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ restroomId: 1, status: 1 });
issueSchema.index({ assignedTo: 1, status: 1 });
issueSchema.index({ provinceId: 1, districtId: 1, cityId: 1 });
issueSchema.index({ categoryId: 1, subCategoryId: 1 });

const Issue = mongoose.model("Issue", issueSchema);

export default Issue;