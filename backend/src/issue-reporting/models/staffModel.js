import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
    {
        // Basic Information (Placeholder - will be expanded by team member)
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        
        // Admin Type
        // 1 = Province Admin
        // 2 = District Admin
        // 3 = City Admin
        adminType: {
            type: Number,
            required: true,
            enum: [1, 2, 3],
            validate: {
                validator: Number.isInteger,
                message: 'adminType must be 1 (Province), 2 (District), or 3 (City)'
            }
        },
        
        // Location Information (based on adminType)
        // Province Admin (1): Only has provinceId
        // District Admin (2): Has provinceId and districtId
        // City Admin (3): Has provinceId, districtId, and cityId
        
        provinceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Province',
            required: true // All admin types need province
        },
        
        districtId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District',
            required: function() {
                // Required for adminType 2 (District) and 3 (City)
                return this.adminType === 2 || this.adminType === 3;
            }
        },
        
        cityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'City',
            required: function() {
                // Required only for adminType 3 (City)
                return this.adminType === 3;
            }
        },
        
        // Status
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Validation: Ensure location fields match adminType
staffSchema.pre('save', function(next) {
    // Province admin should NOT have districtId or cityId
    if (this.adminType === 1) {
        if (this.districtId || this.cityId) {
            return next(new Error('Province admin should only have provinceId'));
        }
    }
    
    // District admin should NOT have cityId
    if (this.adminType === 2) {
        if (this.cityId) {
            return next(new Error('District admin should not have cityId'));
        }
    }
    
    // City admin must have all three location fields
    if (this.adminType === 3) {
        if (!this.provinceId || !this.districtId || !this.cityId) {
            return next(new Error('City admin must have provinceId, districtId, and cityId'));
        }
    }
    
    next();
});

// Create indexes for efficient querying
// Note: email index is auto-created by unique: true
staffSchema.index({ adminType: 1 });
staffSchema.index({ provinceId: 1 });
staffSchema.index({ districtId: 1 });
staffSchema.index({ cityId: 1 });

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;
