import mongoose from "mongoose";

const issueCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        
        description: {
            type: String,
            trim: true,
            default: ""
        },
        
        isActive: {
            type: Boolean,
            default: true
        },
        
        subCategories: [{
            name: {
                type: String,
                required: true,
                trim: true
            },
            description: {
                type: String,
                trim: true,
                default: ""
            },
            isActive: {
                type: Boolean,
                default: true
            }
        }],
        
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

// Indexes (name index is automatically created by unique: true)
issueCategorySchema.index({ isActive: 1 });
issueCategorySchema.index({ 'subCategories.name': 1 });

// Virtual to get active subcategories only
issueCategorySchema.virtual('activeSubCategories').get(function() {
    return this.subCategories.filter(sub => sub.isActive);
});

// Ensure virtual fields are serialized
issueCategorySchema.set('toJSON', { virtuals: true });

const IssueCategory = mongoose.model("IssueCategory", issueCategorySchema);
export default IssueCategory;