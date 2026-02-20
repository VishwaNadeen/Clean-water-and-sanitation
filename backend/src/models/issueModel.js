import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
    {
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
        
        issueType: {
            type: String,
            required: true,
            enum: ['WATER', 'CLEANLINESS', 'PLUMBING', 'LIGHTING', 'SUPPLIES', 'MAINTENANCE', 'OTHER']
        },
        
        // Location Reference
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

const Issue = mongoose.model("Issue", issueSchema);

export default Issue;