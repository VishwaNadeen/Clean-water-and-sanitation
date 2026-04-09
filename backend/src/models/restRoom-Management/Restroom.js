import mongoose from "mongoose";
 const restroomSchema = new mongoose.Schema(
    {
        name: {
            type: String, 
            required: true, 
            trim: true,
        },
        
        city: {
            type: String,
            required: true,
            trim: true,
        },

        district: {
            type: String,
            required: true,
            trim: true,
        },

        province: {
            type: String,
            required: true,
            trim: true,
        },
        //GeoJson point: lng, lat
        location: {
            type: {
                type: String, 
                enum: ["Point"], 
                default: "Point",
            },
            coordinates: {
                type: [Number], 
                required: true,
            },//lng , lat

        },

        condition: {
            type: String,
            enum: ["GOOD", "OK", "BAD", "OUT_OF_ORDER"],
        default: "GOOD",
     },

     avgRating: { 
        type: Number, 
        default: 0,
    },

     ratingCount: {
        type: Number, 
        default: 0,
    },

    // Array of images uploaded to Cloudinary
    // Each image stores its public URL and Cloudinary public_id (needed for deletion)
    images: [
        {
            url:      { type: String, required: true },   // Cloudinary secure URL
            publicId: { type: String, required: true },   // used to delete from Cloudinary later
            uploadedAt: { type: Date, default: Date.now },
        }
    ],

    },

    {timestamps: true}

 );
//prevent duplicate restroom with same name + exact location
restroomSchema.index(
    {
        name: 1,
        "location.coordinates": 1,
    },
    {unique: true}
);

 //needed for $near / $geoNear queries

 restroomSchema.index({ location: "2dsphere"});

 export default mongoose.model("Restroom", restroomSchema);