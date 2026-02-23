import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
    {
        issueNumber: {
            type: String,
            unique: true,
            required: false
        },
        
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
issueSchema.index({ provinceId: 1, districtId: 1, cityId: 1 });
issueSchema.index({ categoryId: 1, subCategoryId: 1 });
issueSchema.index({ issueNumber: 1 }); // For human-readable ID search

// Auto-generate issue number before saving
issueSchema.pre('save', async function() {
    if (this.isNew && !this.issueNumber) {
        let issueNumber;
        let attempts = 0;
        const maxAttempts = 5;
        
        // Retry logic to handle potential race conditions
        while (attempts < maxAttempts) {
            // Get the count of existing issues and add 10000000 for 8-digit number
            const count = await mongoose.models.Issue.countDocuments();
            issueNumber = (10000000 + count + 1).toString();
            
            // Check if this number already exists
            const existingIssue = await mongoose.models.Issue.findOne({ issueNumber });
            if (!existingIssue) {
                this.issueNumber = issueNumber;
                break;
            }
            attempts++;
        }
        
        if (!this.issueNumber) {
            throw new Error('Unable to generate unique issue number');
        }
    }
});

const Issue = mongoose.model("Issue", issueSchema);

export default Issue;